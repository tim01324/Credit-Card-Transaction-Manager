export const PEOPLE = ['Daniel', 'Tim'];
export const DEFAULT_PERSON = 'Tim';
export const ALL_AUDIENCE = 'all';

export function getTransactionPerson(transaction) {
    return PEOPLE.includes(transaction?.person) ? transaction.person : DEFAULT_PERSON;
}

export function getTransactionPeople(transaction) {
    if (transaction?.isSplit) return PEOPLE;
    return [getTransactionPerson(transaction)];
}

export function getTransactionPersonLabel(transaction, audience = ALL_AUDIENCE) {
    if (!transaction?.isSplit) return getTransactionPerson(transaction);
    if (PEOPLE.includes(audience)) return `${audience} (Split)`;
    return PEOPLE.join(' + ');
}

export function isTransactionForAudience(transaction, audience) {
    if (audience === ALL_AUDIENCE) return true;
    return getTransactionPeople(transaction).includes(audience);
}

export function filterTransactionsByAudience(transactions, audience) {
    return transactions.filter(transaction => isTransactionForAudience(transaction, audience));
}

export function calculatePersonTotals(transactions) {
    return transactions.reduce((totals, transaction) => {
        getTransactionPeople(transaction).forEach(person => {
            totals[person] = (totals[person] || 0) + transaction.expense;
        });
        return totals;
    }, PEOPLE.reduce((totals, person) => ({ ...totals, [person]: 0 }), {}));
}
