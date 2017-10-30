/**
 * Created by clx on 2017/10/13.
 */

var dbProducts = require('../data/Specifications');

const products = {
    search: function (req, res) {
        var query = {count: parseInt(req.query.count)};
        var dbData = {
            items: [
                {
                    id: 'foo',
                    code: '210001',
                    grey: {
                        yarn: { //纱支
                            warp: {val: [100]},    //径向
                            weft: {val: [200, 300], unit: 'ss'}     //weixiang
                        },
                        dnsty: {
                            warp: {val: [50]},
                            weft: {val: [60, 80, 100]}
                        }
                    },
                    desc: 'the description of foo'
                }, {
                    id: 'fee',
                    code: '210020',
                    grey: {
                        yarn: { //纱支
                            warp: {val: [90]},    //径向
                            weft: {val: [210, 310], unit: 'pp'}     //weixiang
                        },
                        dnsty: {
                            warp: {val: [58]},
                            weft: {val: [65, 85, 110]}
                        }
                    },
                    desc: 'the description of fee'
                }
            ],
            partial: {
                start: 0,
                count: 3,
                total: 3
            }
        };
        return {
            data: dbData
        };
        //return dbProducts.search(query);
    }
}

module.exports = {
    url: '/rests/products/all/search',
    rests: [
        {
            method: 'Get',
            handler: products.search,
            response: {
                ok: {
                    type: '@collection',
                    "@collection": {type: 'Product'}
                }

            }
        }
    ]
}
