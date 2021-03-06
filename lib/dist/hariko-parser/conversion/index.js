"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entity_builder_1 = require("./builders/entity-builder");
function convert(resources) {
    const entries = resources.rows.reduce((entries, resource) => {
        resource.transitions.forEach((transition) => {
            transition.http_transactions.forEach((http_transaction) => {
                // add entry, generated by http-transaction
                entries.push(entity_builder_1.EntryBuilder.build(http_transaction));
            });
            // add entry from resource, when multiple request
            if (transition.hasMultipleRequest()) {
                const first_http_transaction = transition.http_transactions[0];
                const entry = entity_builder_1.EntryBuilder.buildAbstractly(first_http_transaction.clone());
                entries.push(entry);
            }
        });
        return entries;
    }, []);
    return {
        entries,
        warnings: []
    };
}
exports.convert = convert;
