const chai = require('chai');
const FormattedError = require('../main');

describe('Error Formatter', function() {

    describe('format(message, params)', function() {

        it('params can be a flat object.', function() {
            let error = new FormattedError("Hello {name}!", {
                name: 'Superman'
            });

            chai.assert.equal(error.message, "Hello Superman!");
        });

        it('params can be nested object', function() {
            let error = new FormattedError("Hello {name.first} {name.last}!", {
                name: {
                    first: 'Super',
                    last: 'man'
                }
            });

            chai.assert.equal(error.message, "Hello Super man!");
        });

        it('params that are arrays with primitives are joined together.', function() {
            let error = new FormattedError("Lucky numbers are {lucky.numbers}", {
                lucky: {
                    numbers: ['one', 2, true]
                }
            });

            chai.assert.equal(error.message, "Lucky numbers are one, 2, true");
        });

        it('params that are arrays with objects are ignored.', function() {
            let error = new FormattedError("The winners are {name}", {
                names: [{ name: 'Jacob' }, { name: 'Ryan' }, { name: 'Chris' }]
            });

            chai.assert.equal(error.message, "The winners are {name}");
        });

        it('does nothing when no parameters are given.', function() {
            let error = new FormattedError("My name is {user.name}");
            chai.assert.equal(error.message, "My name is {user.name}");
        });

        it('original message and params don\'t mutate.', function() {
            let error = new FormattedError("Lucky numbers are {lucky.numbers}", {
                lucky: { numbers: ['one', 'two', 'three'] }
            });

            chai.assert.equal(error.original, "Lucky numbers are {lucky.numbers}");
            chai.expect(error.params).to.eql({
                lucky: { numbers: ['one', 'two', 'three'] }
            });
        });

        it('does nothing when a parameter is a function.', function() {
            let error = new FormattedError("My name is {name}", {
                name: function () {
                    return 'Superman'
                }
            });
            chai.assert.equal(error.message, "My name is {name}");
        });

        it('does nothing when there are no placeholders.', function() {
            let error = new FormattedError("My name is name", {
                name: 'Chris'
            });

            chai.assert.equal(error.message, "My name is name");
        });

        it('throws an error when message is not a string.', function() {
            chai.expect(function(){
                let message = new FormattedError(true, {
                    name: 'Superman'
                });
            }).to.throw();
        });

        it('throws an error when params is not an object.', function() {
            chai.expect(function(){
                let message = new FormattedError("This is a {adjective} error.", 123);
            }).to.throw();
        });
    });

});