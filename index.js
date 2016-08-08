/*eslint-env node*/

const _ = require('lodash');

const ERROR_SEVERITY = 2;

function logIssue(issue) {
    const attributes = _.chain(_.toPairs(issue))
                        .filter(([ key, ]) => key !== 'message')
                        .filter(([ , value, ]) => value !== undefined)
                        .map(([ key, value, ]) => `${key}=${value};`)
                        .value();

    return `##vso[task.logissue ${attributes.join('')}]${issue.message}`;
}

module.exports = (results) =>
    _.chain(results)
     .filter((result) => result.messages.length > 0)
     .flatMap((result) => _.chain(result.messages)
                           .map((message) => logIssue({
                               type: (message.fatal || message.severity === ERROR_SEVERITY) ? 'error' : 'warning',
                               sourcepath: result.filePath,
                               linenumber: message.line,
                               columnnumber: message.column,
                               code: message.ruleId,
                               message: message.message,
                            }))
                            .value())
     .value()
     .join('\n');
