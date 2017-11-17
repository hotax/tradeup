/**
 * Created by clx on 2017/10/13.
 */

const line = function () {
    //return dbSpecifications.search(query);
}

module.exports = {
    url: '/finacial/lines/review/orders/draft',
    rests: [
        {
            type: 'query',
            element: 'DraftOrderForFinacialReview',
            handler: line
        }
    ]
}
