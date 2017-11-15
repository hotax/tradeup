/**
 * Created by clx on 2017/10/13.
 */

const place = function (data) {
};

module.exports = {
    url: '/sales/orders/draft',
    rests: [
        {
            type: 'create',
            target: 'DraftOrder',
            handler: place
        }
    ]
}
