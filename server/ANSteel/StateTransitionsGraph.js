/**
 * Created by clx on 2017/10/29.
 */
const Promise = require('bluebird');

module.exports = {
    setResourcesNameList: function (nameList) {
    },
    findTransitions: function (resourceId, context, req) {
        var trans = {
            Login: {
                Sales: "Sales",
                QualityReviewer: "QualityReviewer",
                FinacialReviewer: "FinacialReviewer",
                TransportationReviewer: "TransportationReviewer"
            },
            Sales:{
                "review draft orders": "DraftOrders",
                "draft order": 'DraftOrders'
            },
            DraftOrders:{
                "draft order": 'DraftOrders'
            },
            DraftOrder:{
                edit: "DraftOrder",
                cancel: "DraftOrder",
                "review draft orders": "DraftOrders"
            },
            QualityReviewer:{
                review: "DraftOrderQualityReviewLine"
            },
            DraftOrderForQualityReview:{
                review: "DraftOrderForQualityReview"
            },
            FinacialReviewer:{
                review: "DraftOrderFinacialReviewLine"
            },
            DraftOrderForFinacialReview:{
                review: "DraftOrderForFinacialReview"
            },
            TransportationReviewer:{
                review: "DraftOrderTransportationReviewLine"
            },
            DraftOrderForTransportationReview:{
                review: "DraftOrderForTransportationReview"
            }
        };
        return Promise.resolve(trans[resourceId]);
    }
}
