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
                "draft order": 'DraftOrders',
                "exit": "Login"
            },
            DraftOrders:{
                "draft order": 'DraftOrders',
                "home": "Sales"
            },
            DraftOrder:{
                self: "DraftOrder",
                edit: "DraftOrder",
                cancel: "DraftOrder",
                "review draft orders": "DraftOrders"
            },
            QualityReviewer:{
                review: "DraftOrderQualityReviewLine",
                "exit": "Login"
            },
            DraftOrderQualityReviewLine:{
                "home": "QualityReviewer"
            },
            DraftOrderForQualityReview:{
                self: "DraftOrderForQualityReview",
                review: "DraftOrderForQualityReview",
                close: "DraftOrderForQualityReview",
                line: "DraftOrderQualityReviewLine"
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
