const test = require('node:test');
const assert = require('node:assert/strict');
const { manageCognitoGroups } = require('./index')._internals;

const event = {
    identity: { username: 'synthetic-caller' },
    arguments: { action: 'add', groupName: 'BOARD', cognitoId: 'synthetic-target' }
};

test('raw Cognito errors and identifiers are absent from failure logs', async () => {
    const marker = 'sensitive-directory-error';
    const logs = [];
    const oldError = console.error;
    console.error = (...parts) => logs.push(parts);
    try {
        const result = await manageCognitoGroups(event, {
            adminListGroupsForUser: () => ({ promise: async () => { throw new Error(marker); } })
        });
        assert.equal(result.success, false);
        assert.equal(result.message, 'Unable to verify your permissions');
    } finally {
        console.error = oldError;
    }
    const output = JSON.stringify(logs);
    assert.equal(output.includes(marker), false);
    assert.equal(output.includes('synthetic-caller'), false);
    assert.equal(output.includes('synthetic-target'), false);
});

test('successful audit log contains only allowlisted action and outcome', async () => {
    const logs = [];
    const oldInfo = console.info;
    console.info = (...parts) => logs.push(parts);
    const client = {
        adminListGroupsForUser: ({ Username }) => ({
            promise: async () => Username === 'synthetic-caller'
                ? { Groups: [{ GroupName: 'PRESIDENT' }] }
                : { Groups: [{ GroupName: 'BOARD' }] }
        }),
        adminGetUser: () => ({ promise: async () => ({}) }),
        getGroup: () => ({ promise: async () => ({}) })
    };
    try {
        const result = await manageCognitoGroups(event, client);
        assert.equal(result.success, true);
    } finally {
        console.info = oldInfo;
    }
    assert.deepEqual(logs, [['cognito_group_management', { action: 'add', outcome: 'unchanged' }]]);
    const output = JSON.stringify(logs);
    assert.equal(output.includes('synthetic-caller'), false);
    assert.equal(output.includes('synthetic-target'), false);
});

test('removing BOARD strips every managed role before BOARD', async () => {
    const removed = [];
    let membershipChecks = 0;
    const result = await manageCognitoGroups({
        ...event,
        arguments: { ...event.arguments, action: 'remove', groupName: 'BOARD' }
    }, {
        adminListGroupsForUser: ({ Username }) => ({
            promise: async () => {
                if (Username === 'synthetic-caller') return { Groups: [{ GroupName: 'PRESIDENT' }] };
                membershipChecks += 1;
                return { Groups: [
                    { GroupName: 'BOARD' },
                    { GroupName: 'SECRETARY' },
                    { GroupName: 'MEDIA' },
                    { GroupName: 'UNRELATED' }
                ] };
            }
        }),
        adminGetUser: () => ({ promise: async () => ({}) }),
        getGroup: () => ({ promise: async () => ({}) }),
        adminRemoveUserFromGroup: ({ GroupName }) => ({
            promise: async () => { removed.push(GroupName); }
        })
    });

    assert.equal(result.success, true);
    assert.equal(membershipChecks, 1);
    assert.deepEqual(removed, ['MEDIA', 'SECRETARY', 'BOARD']);
    assert.match(result.message, /all board groups/);
});

test('a bulk removal failure never removes BOARD before remaining roles', async () => {
    const removed = [];
    const result = await manageCognitoGroups({
        ...event,
        arguments: { ...event.arguments, action: 'remove', groupName: 'BOARD' }
    }, {
        adminListGroupsForUser: ({ Username }) => ({
            promise: async () => Username === 'synthetic-caller'
                ? { Groups: [{ GroupName: 'PRESIDENT' }] }
                : { Groups: [
                    { GroupName: 'BOARD' },
                    { GroupName: 'TREASURER' },
                    { GroupName: 'SECRETARY' }
                ] }
        }),
        adminGetUser: () => ({ promise: async () => ({}) }),
        getGroup: () => ({ promise: async () => ({}) }),
        adminRemoveUserFromGroup: ({ GroupName }) => ({
            promise: async () => {
                if (GroupName === 'SECRETARY') throw new Error('synthetic failure');
                removed.push(GroupName);
            }
        })
    });

    assert.equal(result.success, false);
    assert.deepEqual(removed, ['TREASURER']);
    assert.equal(removed.includes('BOARD'), false);
});
