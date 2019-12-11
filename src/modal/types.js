/* @flow */

export type SelectedFunding = {|
    payment_source : {|
        last_digits : string,
        brand : string,
        type : string
    |},
    unbranded : boolean
|};
