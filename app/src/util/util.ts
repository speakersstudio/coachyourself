declare var Stripe: any;

export class Util {

    static indexOfId (array: any[], object: any): number {
        let index = -1,
            term = typeof(object) == 'string' ? object : object._id;
        array.some((o, i) => {
            if ((o._id && o._id == term) || o == term) {
                index = i;
                return true;
            }
        });
        return index;
    }

    static setupStripe(stripeConfig: string): any {
        let stripe = Stripe(stripeConfig);
        let elements = stripe.elements();
        let creditCard = elements.create('card', {
            // value: {postalCode: this.user.zip},
            style: {
                base: {
                    color: '#32325d',
                    lineHeight: '24px',
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',

                    '::placeholder': {
                        color: 'rgba(96,96,96,0.5)'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            }
        });

        return creditCard;
    }

}