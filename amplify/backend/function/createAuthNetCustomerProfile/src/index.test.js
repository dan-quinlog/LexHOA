const test = require('node:test');
const assert = require('node:assert/strict');
const { handler } = require('./index');

test('failure response and log do not expose input or raw errors', async () => {
    const marker = 'sensitive-customer-marker';
    const logs = [];
    const oldError = console.error;
    console.error = (...parts) => logs.push(parts);
    let result;
    try {
        result = await handler({
            arguments: { profileId: marker, email: `${marker}@example.invalid` }
        });
    } finally {
        console.error = oldError;
    }
    assert.deepEqual(result, {
        customerId: '',
        success: false,
        message: 'Unable to create customer profile'
    });
    assert.equal(JSON.stringify(logs).includes(marker), false);
});
