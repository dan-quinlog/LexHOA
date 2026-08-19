const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const template = fs.readFileSync(
    path.join(__dirname, '../../../api/lexhoa/resolvers/Mutation.manageCognitoGroups.req.vtl'),
    'utf8'
);

test('forwards trusted AppSync arguments and caller identity to the Lambda', () => {
    assert.match(template, /"arguments": \$util\.toJson\(\$context\.arguments\)/);
    assert.match(template, /"identity": \$util\.toJson\(\$context\.identity\)/);
    assert.equal(template.includes('$context.request.headers'), false);
});
