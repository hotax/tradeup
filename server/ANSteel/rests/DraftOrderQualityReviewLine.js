/**
 * Created by clx on 2017/10/13.
 */

const line = function () {
    //return dbSpecifications.search(query);
}

module.exports = {
    url: '/sales/orders/draft/qualityReview',
    rests: [
        {
            type: 'query',
            element: 'DraftOrderForQualityReview',
            handler: line
        }
    ]
}
