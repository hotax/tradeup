/**
 * Created by clx on 2017/10/29.
 */
const __checkIfModifyIsPermited = function (context) {
    return !context.review;
};

module.exports = {
    Login: {
        Sales: "Sales",
        QualityReviewer: "QualityReviewer",
        FinacialReviewer: "FinacialReviewer",
        TransportationReviewer: "TransportationReviewer"
    },
    Sales: {
        "review draft orders": "DraftOrders",
        "draft order": 'DraftOrders',
        "exit": "Login"
    },
    DraftOrders: {
        "draft order": 'DraftOrders',
        "home": "Sales"
    },
    DraftOrder: {
        self: "DraftOrder",
        edit: {
            id: "DraftOrder",
            condition: __checkIfModifyIsPermited
        },
        cancel: {
            id: "DraftOrder",
            condition: __checkIfModifyIsPermited
        },
        "review draft orders": "DraftOrders"
    },
    QualityReviewer: {
        review: "DraftOrderQualityReviewLine",
        "exit": "Login"
    },
    DraftOrderQualityReviewLine: {
        "home": "QualityReviewer"
    },
    DraftOrderForQualityReview: {
        self: "DraftOrderForQualityReview",
        review: "DraftOrderForQualityReview",
        close: "DraftOrderForQualityReview",
        line: "DraftOrderQualityReviewLine"
    },
    FinacialReviewer: {
        review: "DraftOrderFinacialReviewLine"
    },
    DraftOrderForFinacialReview: {
        review: "DraftOrderForFinacialReview"
    },
    TransportationReviewer: {
        review: "DraftOrderTransportationReviewLine"
    },
    DraftOrderForTransportationReview: {
        review: "DraftOrderForTransportationReview"
    }
}
