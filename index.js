var _ = require('lodash'),
    util = require('./util.js');

var request = require('request').defaults({
    baseUrl: 'https://api.venmo.com/v1/'
});

var pickInputs = {
        'payment': 'payment'
    },
    pickOutputs = {
        'status': 'data.status',
        'date_completed': 'data.date_completed',
        'target_user': 'data.target.user',
        'actor_username': 'data.actor.username',
        'amount': 'data.amount',
        'note': 'data.note'
    };

module.exports = {
    /**
     * Process data or error.
     *
     * @param error
     * @param response
     * @param body
     */
    processResult: function (error, response, body) {

        if (error)
            this.fail(error);

        else if (body.error)
            this.fail(body.error);

        else
            this.complete(util.pickResult(body, pickOutputs));
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var accessToken = dexter.environment('venmo_access_token'),
            inputs = util.pickStringInputs(step, pickInputs),
            uriLink = 'payments/'.concat(inputs.payment);

        // check params.
        if (!accessToken)
            return this.fail('A [venmo_access_token] environment need for this module.');

        if (!inputs.payment)
            return this.fail('A [payment] need for this module.');

        //send API request
        request.get({
            url: uriLink,
            qs: _.merge({access_token: accessToken}, inputs),
            json: true
        }, function (error, response, body) {

            this.processResult(error, response, body);
        }.bind(this));
    }
};
