/**
 * Created by clx on 2017/10/9.
 */
var proxyquire = require('proxyquire'),
    path = require('path'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

describe('tradup', function () {
    var stubs, err;

    beforeEach(function () {
        stubs = {};
        err = new Error('any error message');
    });

    describe('applications', function () {
        describe('数据库', function () {
            var dbConnection, Schema;
            before(function (done) {
                //ObjectID = require('mongodb').ObjectID;
                mongoose.Promise = global.Promise;
                if (!mongoose.connection.db)
                    dbConnection = mongoose.connect(dbURI, {
                        useMongoClient: false,
                        /* other options */
                    });
                done();

                //initDB(insertDocsInSequential, done);
                //initDB(insertDocsInParallel, done);
            });

            after(function (done) {
                dbConnection.disconnect(done);
            });

            afterEach(function (done) {
                clearDB(done);
            });

            describe('specification', function () {
                var specifications, adata;
                var SpecSchema;

                beforeEach(function () {
                    SpecSchema = require('../server/data/models/specification');
                    specifications = require('../server/data/Specifications');
                    adata = {
                        "code": "1234",
                        "name": "foo",
                        "desc": "this is foo specification",
                        "constructure": "a kind of constructure",
                        "state": 0,
                        "grey": {
                            "yarn": {
                                "warp": {"value": [20, 30, 40], "unit": "s"},
                                "weft": {"value": [20, 30]}
                            },
                            "dnsty": {
                                "warp": {"value": [20]},
                                "weft": {"value": [20, 30, 40], "unit": "ss"}
                            },
                            "width": 45,
                            "GSM": 28
                        },
                        "product": {
                            "yarn": {
                                "warp": {"value": [20, 30, 40], "unit": "s"},
                                "weft": {"value": [20, 30]}
                            },
                            "dnstyBW": {
                                "warp": {"value": [20]},
                                "weft": {"value": [20, 30, 40], "unit": "ss"}
                            },
                            "dnstyAW": {
                                "warp": {"value": [20]},
                                "weft": {"value": [20, 30, 40], "unit": "ss"}
                            },
                            "width": 85,
                            "GSM": 50
                        }
                    }
                });

                describe('表达式', function () {
                    var model;

                    describe('纱支值表达式', function () {
                        beforeEach(function () {
                            adata.product.yarn.warp = {};
                            model = new SpecSchema(adata);
                        });

                        it('纱支值表达式错：未以“[”开头', function () {
                            expect(function () {
                                model.product.yarn.warp.desc = "20,30,40unit";
                            }).throw('纱支值表达式(20,30,40unit)错：未以“[”开头');
                        });

                        it('纱支值表达式错：未包含“]”', function () {
                            expect(function () {
                                model.product.yarn.warp.desc = "[20,30,40unit";
                            }).throw('纱支值表达式([20,30,40unit)错：未包含“]”');
                        });

                        it('纱支值表达式错：包含多个“]”', function () {
                            expect(function () {
                                model.product.yarn.warp.desc = "[20,30,40]un]it";
                            }).throw('纱支值表达式([20,30,40]un]it)错：包含多个“]”');
                        });

                        it('纱支值表达式错：包含多个“]”', function () {
                            expect(function () {
                                model.product.yarn.warp.desc = "[20.45,30a,40]unit";
                            }).throw('纱支值表达式([20.45,30a,40]unit)错：纱支数非数字');
                        });

                        it('用纱支值表达式赋值', function () {
                            model.product.yarn.warp.desc = "[20.45,30,40]unit";
                            expect(model.product.yarn.warp.value.toObject()).eql([20.45, 30, 40]);
                            expect(model.product.yarn.warp.unit).eql('unit');
                        });

                        it('用纱支值表达式赋值 - 无单位', function () {
                            model.product.yarn.warp.desc = "[20.45,30,40]";
                            expect(model.product.yarn.warp.value.toObject()).eql([20.45, 30, 40]);
                            expect(model.product.yarn.warp.unit).undefined;
                        });
                    });

                    describe('径向纬向纱支表达式', function () {
                        beforeEach(function () {
                            adata.product.yarn = {};
                            model = new SpecSchema(adata);
                        });

                        it('用纱支值表达式赋值', function () {
                            model.product.yarn.desc = {
                                warp: "[20,40,60]aa",
                                weft: "[100]",
                            };
                            expect(model.product.yarn.warp.value.toObject()).eql([20, 40, 60]);
                            expect(model.product.yarn.warp.unit).eql('aa');
                            expect(model.product.yarn.weft.value.toObject()).eql([100]);
                            expect(model.product.yarn.weft.unit).undefined;
                        });
                    });
                });

                it('新增', function () {
                    var dataToAdd = {
                        "code": "1234",
                        "name": "foo",
                        "desc": "this is foo specification",
                        "constructure": "a kind of constructure",
                        "grey": {
                            "yarn": {
                                "warp": "[20,30,40]s",
                                "weft": "[20,30]"
                            },
                            "dnsty": {
                                "warp": "[20]",
                                "weft": "[20,30,40]ss"
                            },
                            "width": 45,
                            "GSM": 28
                        },
                        "product": {
                            "yarn": {
                                "warp": "[20,30,40]s",
                                "weft": "[20,30]"
                            },
                            "dnstyBW": {
                                "warp": "[20]",
                                "weft": "[20,30,40]ss"
                            },
                            "dnstyAW": {
                                "warp": "[20]",
                                "weft": "[20,30,40]ss"
                            },
                            "width": 85,
                            "GSM": 50
                        }
                    }
                    return specifications.add(dataToAdd)
                        .then(function (obj) {
                            expect(obj.id.length).eql(24);
                            expect(obj.createDate).not.null;
                            expect(obj.modifiedDate).not.null;
                            expect(obj.__v).eql(0);

                            delete obj.id;
                            delete obj.createDate;
                            delete obj.modifiedDate;
                            delete obj.__v;

                            expect(obj).eql(dataToAdd);
                        });
                });

                it('读取', function () {
                    var expectedData;
                    return new SpecSchema(adata).save()
                        .then(function (data) {
                            expectedData = {
                                id: data.id,
                                code: data.code,
                                name: data.name,
                                desc: data.desc,
                                constructure: data.constructure,
                                grey: {
                                    yarn: data.grey.yarn.desc,
                                    dnsty: data.grey.dnsty.desc,
                                    width: data.grey.width,
                                    GSM: data.grey.GSM
                                },
                                product: {
                                    yarn: data.product.yarn.desc,
                                    dnstyBW: data.product.dnstyBW.desc,
                                    dnstyAW: data.product.dnstyAW.desc,
                                    width: data.product.width,
                                    GSM: data.product.GSM
                                },
                                createDate: data.createDate,
                                modifiedDate: data.modifiedDate,
                                __v: data.__v
                            };
                            return specifications.findById(data.id);
                        })
                        .then(function (data) {
                            expect(data).eql(expectedData);
                        })
                });

                describe('搜索产品规格', function () {
                    it('未指定任何查询条件', function () {
                        var expectedData = {
                            "items": [
                                {
                                    "code": "1234",
                                    "desc": "this is foo specification",
                                    "grey": {
                                        "GSM": 28,
                                        "dnsty": {
                                            "warp": "[20]",
                                            "weft": "[20,30,40]ss",
                                        },
                                        "width": 45,
                                        "yarn": {
                                            "warp": "[20,30,40]s",
                                            "weft": "[20,30]",
                                        }
                                    },
                                    "id": "59fc51c11db85e2efcd19cb0",
                                    "name": "foo"
                                }
                            ],
                            "page": 1,
                            "perpage": 10,
                            "total": 2
                        };

                        anotherData = {
                            "code": "ffff",
                            "name": "ffff",
                            "desc": "this is foo specification",
                            "constructure": "a kind of constructure",
                            createDate: new Date(2017, 4, 10)
                        };

                        var model = new SpecSchema(anotherData);
                        return model.save()
                            .then(function (data) {
                                model = new SpecSchema(adata)
                                return model.save();
                            })
                            .then(function (data) {
                                expectedData.items[0].id = data.id;
                                expectedData.items[0].createDate = data.createDate;
                                return specifications.search()
                                    .then(function (obj) {
                                        obj.items = [obj.items[0]];
                                        expect(obj).eql(expectedData);
                                    });
                            })
                    });
                });
            });

            describe('ANSteel Sales', function () {
                var fooSampleDraftOrder;

                beforeEach(function () {
                    fooSampleDraftOrder = {
                        "orderNo": "162810026",
                        "productLine": "冷轧#1线",
                        "customer": "1004234",
                        "settlement": {
                            "account": "23456788",
                            "taxType": "非免税"
                        },
                        "items": [
                            {
                                "no": "001",
                                "product": "优质结构碳素钢",
                                "spec": "规格1",
                                "qty": {
                                    "value": 60,
                                    "unit": "T"
                                },
                                "transportation": {
                                    "type": "铁运",
                                    "dest": "大连东",
                                    "package": "冷卷简易包装",
                                    "label": "中船冷轧#1"
                                },
                                "due": {
                                    "type": "W",
                                    "from": new Date(2018, 11, 1),
                                    "to": new Date(2018, 11, 30)
                                },
                                "price": {
                                    "price": 2300,
                                    "discount": 80,
                                    "taxRate": 0.001,
                                    "fee": 0.52
                                }
                            },
                            {
                                "no": "002",
                                "product": "优质结构碳素钢",
                                "spec": "规格2",
                                "qty": {
                                    "value": 80,
                                    "unit": "T"
                                },
                                "transportation": {
                                    "type": "汽运",
                                    "dest": "铁岭",
                                    "package": "冷卷简易包装",
                                    "label": "中船冷轧#2"
                                },
                                "due": {
                                    "type": "W",
                                    "from": new Date(2018, 12, 1),
                                    "to": new Date(2018, 12, 31)
                                },
                                "price": {
                                    "price": 2400,
                                    "discount": 80,
                                    "taxRate": 0.001,
                                    "fee": 3.1
                                }
                            }
                        ],
                        "sales": "张三",
                        "createDate": new Date(2017, 11, 11)
                    };
                });

                it('销售订单', function () {
                    Schema = require('../server/ANSteel/data/models/salesorder');
                    return new Schema(fooSampleDraftOrder).save()
                        .then(function (obj) {
                            expect(obj).not.null;
                        });
                });

                describe('业务', function () {
                    describe('销售订单', function () {
                        var salesOrders, orderModel;

                        beforeEach(function () {
                            orderModel = require('../server/ANSteel/data/models/salesorder');
                            salesOrders = proxyquire('../server/ANSteel/biz/sales/SalesOrders', stubs);
                        });

                        describe('草拟订单', function () {
                            beforeEach(function () {
                            });

                            it('添加订单失败', function () {
                                var ordersDbModelMock = {mock: "salesorder"};
                                stubs['../../data/models/salesorder'] = ordersDbModelMock;
                                var order = {data: "any data of order"};
                                var createStub = createPromiseStub([ordersDbModelMock, order], null, err);
                                stubs['../../../../netup/db/mongoDb/SaveObjectToDb'] = createStub;
                                salesOrders = proxyquire('../server/ANSteel/biz/sales/SalesOrders', stubs);
                                return salesOrders.draft(order)
                                    .catch(function (e) {
                                        expect(e).eql(err);
                                    })
                            })
                        });

                        describe('按标识读取订单草稿', function () {
                            var orderInDb, id;

                            beforeEach(function () {
                                return new orderModel(fooSampleDraftOrder).save()
                                    .then(function (model) {
                                        orderInDb = model;
                                        id = orderInDb.id;
                                    })
                            });

                            it('正确读取', function () {
                                return salesOrders.findById(id)
                                    .then(function (data) {
                                        expect(data).not.null;
                                        //expect(data).eql({});
                                    })
                            })
                        });

                        describe('列出所有订单草稿', function () {
                            var foo, fooid, fooCreateDate;
                            var fee, feeid, feeCreateDate;

                            beforeEach(function () {
                                fooCreateDate = new Date(2017, 11, 15);
                                feeCreateDate = new Date(2017, 11, 16);
                                foo = {orderNo: "foo", createDate: fooCreateDate};
                                fee = {orderNo: "fee", createDate: feeCreateDate};
                                return new orderModel(foo).save()
                                    .then(function (model) {
                                        fooid = model.id;
                                        return new orderModel(fee).save()
                                            .then(function (model) {
                                                feeid = model.id;
                                            })
                                    })
                            });

                            it('全部列出', function () {
                                return salesOrders.listDrafts()
                                    .then(function (list) {
                                        delete list.items[0].id;
                                        delete list.items[1].id;
                                        expect(list).eql({"items": [fee, foo]});
                                    });
                            });
                        });

                        describe('按标识读取用于质量评审的订单草稿', function () {
                            var orderInDb, id;

                            beforeEach(function () {
                                return new orderModel(fooSampleDraftOrder).save()
                                    .then(function (model) {
                                        orderInDb = model;
                                        id = orderInDb.id;
                                    })
                            });

                            it('正确读取', function () {
                                return salesOrders.findDraftForQualityReview(id)
                                    .then(function (data) {
                                        expect(fooSampleDraftOrder.orderNo).eql(data.orderNo);
                                        expect(fooSampleDraftOrder.productLine).eql(data.productLine);
                                        expect(data.items).eql([
                                            {
                                                "no": "001",
                                                "product": "优质结构碳素钢",
                                                "spec": "规格1",
                                                "qty": {
                                                    "value": 60,
                                                    "unit": "T"
                                                },
                                                "due": {
                                                    "type": "W",
                                                    "from": new Date(2018, 11, 1),
                                                    "to": new Date(2018, 11, 30)
                                                }
                                            },
                                            {
                                                "no": "002",
                                                "product": "优质结构碳素钢",
                                                "spec": "规格2",
                                                "qty": {
                                                    "value": 80,
                                                    "unit": "T"
                                                },
                                                "due": {
                                                    "type": "W",
                                                    "from": new Date(2018, 12, 1),
                                                    "to": new Date(2018, 12, 31)
                                                }
                                            }
                                        ]);
                                    })
                            })
                        });

                        describe('列出所有送交质量评审的订单草稿', function () {
                            var foo, fooid, fooCreateDate;
                            var fee, feeid, feeCreateDate;

                            beforeEach(function () {
                                fooCreateDate = new Date(2017, 11, 15);
                                feeCreateDate = new Date(2017, 11, 16);
                                foo = {orderNo: "foo", createDate: fooCreateDate};
                                fee = {orderNo: "fee", createDate: feeCreateDate};
                                return new orderModel(foo).save()
                                    .then(function (model) {
                                        fooid = model.id;
                                        return new orderModel(fee).save()
                                            .then(function (model) {
                                                feeid = model.id;
                                            })
                                    })
                            });

                            it('全部列出', function () {
                                return salesOrders.listDraftsForQualityReview()
                                    .then(function (list) {
                                        delete list.items[0].id;
                                        delete list.items[1].id;
                                        expect(list).eql({"items": [fee, foo]});
                                    });
                            });
                        });
                    });
                });
            });

            it('Db object saver', function () {
                var dbSchema = new mongoose.Schema({
                    "foo": String,
                    "fee": String
                });
                Schema = mongoose.model('coll', dbSchema);
                var save = require('../netup/db/mongoDb/SaveObjectToDb');

                dataToAdd = {foo: "foo", fee: "fee"};
                return save(Schema, dataToAdd)
                    .then(function (data) {
                        expect(data).not.null;
                    })
            });
        });

        describe('rests', function () {
            var req, res, handler, RequestMock, ResponseMock;

            beforeEach(function () {
                RequestMock = require('mock-express-request');
                ResponseMock = require('mock-express-response');
            });

            describe('新增规格', function () {
                it('成功处理', function (done) {
                    var postedData = {data: 'any specification to add'};

                    var addStub = createPromiseStub([postedData], [postedData]);
                    stubs['../data/Specifications'] = {add: addStub};
                    var desc = proxyquire('../server/rests/Specifications', stubs);

                    desc.rests[0].handler(postedData)
                        .then(function (data) {
                            expect(data).eql(postedData);
                            done();
                        })
                });
            });

            describe('搜索产品规格', function () {

                it('搜索失败', function (done) {
                    var result = {
                        code: 'InvalidatedQuery',
                        reason: '失败原因'
                    };
                    var searchStub = createPromiseStub([], null, result);
                    stubs['../data/Specifications'] = {search: searchStub};
                    var desc = proxyquire('../server/rests/SpecificationSearch', stubs);

                    req = new RequestMock();

                    desc.rests[0].handler(req)
                        .catch(function (err) {
                            expect(err).eql(result);
                            done();
                        });
                });

                it('成功搜索', function (done) {
                    var result = {
                        items: [
                            {
                                id: 'abcdefg',
                                code: '12345',
                                name: 'foo',
                                desc: 'desc of foo',
                                grey: {
                                    yarn: {
                                        warp: '[10, 20]ss',
                                        weft: '[10]'
                                    },
                                    dnsty: {
                                        warp: '[50, 80, 100]',
                                        weft: '[40]pp'
                                    }
                                }
                            }
                        ],
                        page: 1,
                        perpage: 10,
                        total: 200
                    };

                    var searchStub = createPromiseStub([], [result]);
                    stubs['../data/Specifications'] = {search: searchStub};
                    var desc = proxyquire('../server/rests/SpecificationSearch', stubs);

                    desc.rests[0].handler()
                        .then(function (data) {
                            expect(data).eql(result);
                            done();
                        })
                });
            });

            describe('Hyperbucks', function () {
                describe('服务员下单', function () {
                    beforeEach(function () {
                        handler = require('../server/rests/OrdersFulfillment').rests[0].handler;
                    });

                    it('添加订单失败', function () {
                        //var createOrderStub = createPromiseStub([orderPlaced], null, err);
                        //TODO:实现服务员下单服务
                    })
                });
            });

            describe('ANSteel', function () {
                describe('销售人员需要能够获得订单草稿', function () {
                    var salesOrders;
                    beforeEach(function () {
                        salesOrders = {
                            findById: function (id) {
                            }
                        };
                        salesOrders = sinon.stub(salesOrders);
                        stubs['../biz/sales/SalesOrders'] = salesOrders;
                        handler = proxyquire('../server/ANSteel/rests/DraftOrder', stubs).rests[0].handler;
                    });

                    it('成功获得指定的订单草稿', function () {
                        var orderId = '4355rffss';
                        var order = {order: 'any order data'};
                        req = {
                            params: {
                                id: orderId
                            }
                        };
                        salesOrders.findById.withArgs(orderId).returns(Promise.resolve(order));
                        return handler(req, res)
                            .then(function (data) {
                                expect(data).eql(order);
                            })
                    })
                });
            });
        });
    });

    describe('netup', function () {
        describe('同数据库相关部件', function () {
            it('开发人员可以通过mongoose使应用连接到mongoDb数据库', function (done) {
                process.env.MONGODB = 'mongodb://localhost:27017/test';
                var connectDb = require('../netup/db/mongoDb/ConnectMongoDb');
                connectDb(function () {
                    done();
                });
            });

            describe('分页查询工厂', function () {
                var execStub, Schema, SchemaMock, paginatingQuery;
                var dbdata, countNum, expectedData;
                var options;

                beforeEach(function () {
                    execStub = sinon.stub();
                    Schema = {
                        find: function () {
                        },
                        select: function () {
                        },
                        limit: function () {
                        },
                        skip: function () {
                        },
                        sort: function () {
                        },
                        count: function () {
                        },
                        exec: execStub
                    };
                    SchemaMock = sinon.mock(Schema);

                    dbdata = [{data: 'foo'}, {data: 'fee'}];
                    countNum = 300;
                    expectedData = {
                        items: dbdata,
                        total: countNum,
                        page: 1,
                        perpage: 10
                    }

                    execStub.returns(Promise.resolve(dbdata));
                    execStub.onCall(0).returns(Promise.resolve(dbdata));
                    execStub.onCall(1).returns(Promise.resolve(countNum));

                    SchemaMock.expects('count').withArgs().once().returns(Schema);
                    paginatingQuery = require('../netup/db/mongoDb/PaginatingQuery');

                    options = {schema: Schema}
                });

                it('未指定查询选项', function () {
                    expect(function () {
                        paginatingQuery.query();
                    }).throw('a query options with db schema should be given');
                });

                it('未指定查询集合', function () {
                    expect(function () {
                        paginatingQuery.query({});
                    }).throw('a query options with db schema should be given');
                });

                it('查询指定集合', function (done) {
                    SchemaMock.expects('find').withArgs({}).once().returns(Schema);
                    SchemaMock.expects('limit').withArgs(10).once().returns(Schema);
                    SchemaMock.expects('skip').withArgs(0).once().returns(Schema);

                    paginatingQuery.query(options)
                        .then(function (data) {
                            expect(data).eql(expectedData);
                            SchemaMock.verify();
                            done();
                        })
                });

                it('指定查询条件', function (done) {
                    var queryconditions = {conditions: 'any query conditions'};
                    SchemaMock.expects('find').withArgs(queryconditions).once().returns(Schema);
                    SchemaMock.expects('limit').withArgs(10).once().returns(Schema);
                    SchemaMock.expects('skip').withArgs(0).once().returns(Schema);

                    options.conditions = queryconditions;
                    paginatingQuery.query(options)
                        .then(function (data) {
                            expect(data).eql(expectedData);
                            SchemaMock.verify();
                            done();
                        })
                });

                it('指定查询输出字段', function (done) {
                    var select = 'f1 f2';
                    SchemaMock.expects('select').withArgs(select).once().returns(Schema);
                    SchemaMock.expects('find').withArgs({}).once().returns(Schema);
                    SchemaMock.expects('limit').withArgs(10).once().returns(Schema);
                    SchemaMock.expects('skip').withArgs(0).once().returns(Schema);

                    options.select = select;
                    paginatingQuery.query(options)
                        .then(function (data) {
                            expect(data).eql(expectedData);
                            SchemaMock.verify();
                            done();
                        })
                });

                it('指定每页记录数', function (done) {
                    var perpage = 5;
                    SchemaMock.expects('find').withArgs({}).once().returns(Schema);
                    SchemaMock.expects('limit').withArgs(perpage).once().returns(Schema);
                    SchemaMock.expects('skip').withArgs(0).once().returns(Schema);

                    options.perpage = perpage;
                    expectedData.perpage = perpage;
                    paginatingQuery.query(options)
                        .then(function (data) {
                            expect(data).eql(expectedData);
                            SchemaMock.verify();
                            done();
                        })
                });

                it('指定当前页', function (done) {
                    var page = 3;
                    SchemaMock.expects('find').withArgs({}).once().returns(Schema);
                    SchemaMock.expects('limit').withArgs().once().returns(Schema);
                    SchemaMock.expects('skip').withArgs(20).once().returns(Schema);

                    options.page = page;
                    expectedData.page = page;

                    paginatingQuery.query(options)
                        .then(function (data) {
                            expect(data).eql(expectedData);
                            SchemaMock.verify();
                            done();
                        })
                });

                it('指定数据库返回数组中各项数据元素的处理方法', function (done) {
                    SchemaMock.expects('find').withArgs({}).once().returns(Schema);
                    SchemaMock.expects('limit').withArgs(10).once().returns(Schema);
                    SchemaMock.expects('skip').withArgs(0).once().returns(Schema);

                    var dataHandleStub = sinon.stub();
                    dataHandleStub.withArgs(dbdata[0]).returns('foo');
                    dataHandleStub.withArgs(dbdata[1]).returns('fee');

                    options.handler = dataHandleStub;
                    paginatingQuery.query(options)
                        .then(function (data) {
                            expect(data).eql({
                                items: ['foo', 'fee'],
                                total: countNum,
                                page: 1,
                                perpage: 10
                            });
                            SchemaMock.verify();
                            done();
                        })
                })
            })
        });

        describe('Restful', function () {

            describe('基于目录内资源描述文件的资源加载器', function () {
                var loader;

                beforeEach(function () {
                });

                it('加载一个资源描述', function () {
                    var fooDesc = require('./data/rests/foo');
                    loader = require('../netup/rests/DirectoryResourceDescriptorsLoader');
                    expect(loader.loadFrom(path.join(__dirname, './data/rests'))).eql({
                        foo: fooDesc
                    });
                });
            });

            describe('对Rest服务的解析', function () {
                var requestAgent, app, request;
                var url, desc, currentResource;
                var selfUrl, urlResolveStub, restDescriptor;

                beforeEach(function () {
                    url = '/rests/foo';
                    var bodyParser = require('body-parser');
                    requestAgent = require('supertest');
                    app = require('express')();
                    request = requestAgent(app);
                    app.use(bodyParser.json());

                    err = "any error ...."
                    currentResource = {
                        getResourceId: function () {
                        },
                        getUrl: function () {
                        },
                        getTransitionUrl: function () {
                        },
                        getLinks: function () {
                        }
                    };
                    currentResource = sinon.stub(currentResource);

                    selfUrl = '/rests/foo/self';
                    urlResolveStub = sinon.stub();
                    stubs['../express/Url'] = {resolve: urlResolveStub};
                    restDescriptor = proxyquire('../netup/rests/RestDescriptor', stubs);
                });

                describe('入口服务', function () {
                    beforeEach(function () {
                        desc = {
                            type: 'entry'
                        };
                        restDescriptor.attach(app, currentResource, url, desc);
                    });

                    it('正确响应', function (done) {
                        var expectedLinks = [
                            {rel: 'rel1', href: '/href1'},
                            {rel: 'rel2', href: '/href2'}
                        ];
                        currentResource.getLinks.returns(Promise.resolve(expectedLinks));

                        request.get(url)
                            .expect('Content-Type', 'application/vnd.hotex.com+json; charset=utf-8')
                            .expect(200, {
                                links: expectedLinks
                            }, done);
                    });

                    it('未知错误返回500内部错', function (done) {
                        currentResource.getLinks.returns(Promise.reject(err));
                        request.get(url)
                            .expect(500, err, done);
                    });
                });

                describe('查询服务', function () {
                    var elementResourceId, reqQuery, searchStub, resultCollection;

                    beforeEach(function () {
                        reqQuery = {arg1: "aaa", arg2: 'bbb'};
                        elementResourceId = "fuuuuuu";
                        searchStub = sinon.stub();

                        desc = {
                            type: 'query',
                            element: elementResourceId,
                            handler: searchStub
                        };

                        restDescriptor.attach(app, currentResource, url, desc);
                    });

                    it('正确响应', function (done) {
                        var queryStr = "?arg1=aaa&arg2=bbb";
                        var element1 = {id: '001', foo: 'foo 1', fee: 'fee 1'};
                        var element2 = {id: '002', foo: 'foo 2', fee: 'fee 2'};
                        resultCollection = {
                            items: [element1, element2],
                            perpage: 10,
                            page: 1,
                            total: 200
                        };
                        searchStub.withArgs(reqQuery).returns(Promise.resolve(resultCollection));

                        var expectedLinks = [
                            {rel: 'rel1', href: '/href1'},
                            {rel: 'rel2', href: '/href2'}
                        ];
                        currentResource.getLinks
                            .callsFake(function (context, req) {
                                expect(context).eql(resultCollection);
                                expect(req.originalUrl).eql(url + queryStr);
                                return Promise.resolve(expectedLinks);
                            });

                        var refElement1 = '/ref/element/001';
                        var refElement2 = '/ref/element/002';
                        currentResource.getTransitionUrl.callsFake(function (targetResourceId, context, req) {
                            expect(targetResourceId).eql(elementResourceId);
                            expect(req.originalUrl).eql(url + queryStr);
                            var refurl;
                            if (context === element1) refurl = refElement1;
                            if (context === element2) refurl = refElement2;
                            return refurl;
                        });

                        urlResolveStub.callsFake(function (req, urlArg) {
                            expect(urlArg).eql(url + queryStr);
                            return selfUrl;
                        });
                        restDescriptor = proxyquire('../netup/rests/RestDescriptor', stubs);
                        restDescriptor.attach(app, currentResource, url, desc);

                        request.get(url)
                            .query(reqQuery)
                            .expect('Content-Type', 'application/vnd.hotex.com+json; charset=utf-8')
                            .expect(200, {
                                collection: {
                                    href: selfUrl,
                                    items: [
                                        {
                                            link: {rel: elementResourceId, href: refElement1},
                                            data: {foo: 'foo 1', fee: 'fee 1'}
                                        },
                                        {
                                            link: {rel: elementResourceId, href: refElement2},
                                            data: {foo: 'foo 2', fee: 'fee 2'}
                                        }
                                    ],
                                    perpage: 10,
                                    page: 1,
                                    total: 200
                                },
                                links: expectedLinks
                            }, done);
                    });

                    it('未知错误返回500内部错', function (done) {
                        err = "any error ...."
                        searchStub.returns(Promise.reject(err));
                        request.get(url)
                            .expect(500, err, done);
                    });
                });

                describe('创建资源服务', function () {
                    var targetResourceId, reqBody, createStub, objCreated;
                    beforeEach(function () {
                        targetResourceId = "fuuuuuu";
                        createStub = sinon.stub();
                        desc = {
                            type: 'create',
                            target: targetResourceId,
                            handler: createStub
                        };

                        restDescriptor.attach(app, currentResource, url, desc);
                    });

                    it('正确响应', function (done) {
                        reqBody = {foo: "any request data used to create object"};
                        objCreated = {
                            __id: 'fooid',
                            foo: 'foo',
                            fee: 'fee'
                        };
                        createStub.withArgs(reqBody).returns(Promise.resolve(objCreated));

                        var expectedLinks = [
                            {rel: 'rel1', href: '/href1'},
                            {rel: 'rel2', href: '/href2'}
                        ];
                        currentResource.getLinks
                            .callsFake(function (context, req) {
                                expect(context).eql(objCreated);
                                expect(req.originalUrl).eql(url);
                                return Promise.resolve(expectedLinks);
                            });
                        var urlToCreatedObject = "/url/to/created/obj";
                        currentResource.getTransitionUrl.callsFake(function (target, context, req) {
                            expect(target).eql(targetResourceId);
                            expect(context).eql(objCreated);
                            expect(req.originalUrl).eql(url);
                            return urlToCreatedObject;
                        });

                        request.post(url)
                            .send(reqBody)
                            .expect('Content-Type', 'application/vnd.hotex.com+json; charset=utf-8')
                            .expect('Location', urlToCreatedObject)
                            .expect(201, {
                                href: urlToCreatedObject,
                                fuuuuuu: objCreated,
                                links: expectedLinks
                            }, done);
                    });

                    it('未知错误返回500内部错', function (done) {
                        createStub.returns(Promise.reject(err));
                        request.post(url)
                            .send(reqBody)
                            .expect(500, err, done);
                    });
                });

                describe('读取资源状态服务', function () {
                    var resourceId, handlerStub, objRead, version;
                    beforeEach(function () {
                        resourceId = "fuuuu";
                        version = "123456";
                        handlerStub = sinon.stub();
                        desc = {
                            type: 'read',
                            handler: handlerStub
                        };
                    });

                    it('正确响应', function (done) {
                        currentResource.getResourceId.returns(resourceId);

                        objRead = {
                            id: 'fooid',
                            foo: 'foo',
                            fee: 'fee',
                            __v: version
                        };
                        handlerStub.returns(Promise.resolve(objRead));

                        var expectedLinks = [
                            {rel: 'rel1', href: '/href1'},
                            {rel: 'rel2', href: '/href2'}
                        ];
                        currentResource.getLinks
                            .callsFake(function (context, req) {
                                expect(context).eql(objRead);
                                expect(req.originalUrl).eql(url);
                                return Promise.resolve(expectedLinks);
                            });

                        var representedObject = Object.assign({}, objRead);
                        delete representedObject.__v;
                        var representation = {
                            href: selfUrl,
                            links: expectedLinks
                        };
                        representation[resourceId] = representedObject;

                        urlResolveStub.callsFake(function (req, urlArg) {
                            expect(urlArg).eql(url);
                            return selfUrl;
                        });
                        restDescriptor = proxyquire('../netup/rests/RestDescriptor', stubs);
                        restDescriptor.attach(app, currentResource, url, desc);

                        request.get(url)
                            .expect('Content-Type', 'application/vnd.hotex.com+json; charset=utf-8')
                            .expect('ETag', version)
                            .expect(200, representation, done);
                    });

                    it('未知错误返回500内部错', function (done) {
                        handlerStub.returns(Promise.reject(err));
                        restDescriptor.attach(app, currentResource, url, desc);
                        request.get(url)
                            .expect(500, err, done);
                    });
                });
            });

            describe('对资源描述的解析', function () {
                var request, router, handler, url;
                var desc, restDesc, resourceId;
                var resourceRegistry, attachSpy;
                var dataToRepresent;

                beforeEach(function () {
                    resourceId = 'foo';
                    dataToRepresent = {data: 'any data'};
                    router = require('express')();
                    request = require('supertest')(router);
                    url = '/rests/foo';
                    handler = function (req, res) {
                        return dataToRepresent;
                    };

                    restDesc = {rest: 'any rest descriptor'};

                    desc = {
                        url: url,
                        rests: [restDesc]
                    }

                    attachSpy = sinon.spy();
                    stubs['./RestDescriptor'] = {attach: attachSpy};
                    resourceRegistry = proxyquire('../netup/rests/ResourceRegistry', stubs);
                });

                it('一个资源应具有寻址性，必须定义url模板', function () {
                    delete desc.url;
                    expect(function () {
                        resourceRegistry.attach(router, resourceId, desc);
                    }).throw('a url must be defined!');
                });

                it('提供当前资源标识', function () {
                    var resource = resourceRegistry.attach(router, 'foo', desc);
                    expect(resource.getResourceId()).eql('foo');
                });

                describe('构建当前资源的URL', function () {
                    var fromResourceId, context, req;
                    var resource;
                    var expectedUrl, urlResolveStub;

                    beforeEach(function () {
                        fromResourceId = 'fff';
                        context = {};
                        req = {
                            params: {},
                            query: {}
                        }

                        expectedUrl = "/expected/url";
                        urlResolveStub = sinon.stub();
                        stubs['../express/Url'] = {resolve: urlResolveStub};
                    });

                    it('无路径变量', function () {
                        urlResolveStub.withArgs(req, url).returns(expectedUrl);
                        resourceRegistry = proxyquire('../netup/rests/ResourceRegistry', stubs);

                        resource = resourceRegistry.attach(router, resourceId, desc);
                        expect(resource.getUrl(fromResourceId, context, req)).eql(expectedUrl);
                    });

                    it('未定义迁移，缺省方式从上下文中取同路径变量名相同的属性值', function () {
                        desc.url = '/url/:arg1/and/:arg2/and/:arg3';
                        context.arg3 = '1234';
                        req.params.arg2 = '3456';
                        req.query.arg1 = '5678';

                        urlResolveStub.withArgs(req, '/url/5678/and/3456/and/1234').returns(expectedUrl);
                        resourceRegistry = proxyquire('../netup/rests/ResourceRegistry', stubs);

                        resource = resourceRegistry.attach(router, resourceId, desc);
                        expect(resource.getUrl(fromResourceId, context, req)).eql(expectedUrl);
                    });

                    it('通过定义迁移指定路径变量的取值', function () {
                        desc.transitions = {};
                        desc.transitions[fromResourceId] = {
                            arg1: 'query.foo',
                            arg2: 'params.foo',
                            arg3: 'context.foo'
                        };
                        desc.url = '/url/:arg1/and/:arg2/and/:arg3/and/:arg4';
                        context.foo = '1234';
                        context.arg4 = '9876';
                        req.params.foo = '3456';
                        req.query.foo = '5678';

                        urlResolveStub.withArgs(req, '/url/5678/and/3456/and/1234/and/9876').returns(expectedUrl);
                        resourceRegistry = proxyquire('../netup/rests/ResourceRegistry', stubs);

                        resource = resourceRegistry.attach(router, resourceId, desc);
                        expect(resource.getUrl(fromResourceId, context, req)).eql(expectedUrl);
                    });

                    it('构建从当前资源迁移到指定资源的URL', function () {
                        var fooDesc = {
                            url: '/url/foo',
                            rests: [restDesc]
                        };
                        var feeDesc = {
                            url: '/url/fee',
                            rests: [restDesc]
                        };

                        urlResolveStub.withArgs(req, '/url/fee').returns(expectedUrl);
                        resourceRegistry = proxyquire('../netup/rests/ResourceRegistry', stubs);

                        var fooResource = resourceRegistry.attach(router, 'foo', fooDesc);
                        resourceRegistry.attach(router, 'fee', feeDesc);
                        expect(fooResource.getTransitionUrl('fee', context, req)).eql(expectedUrl);
                    });
                });

                it('获得当前资源状态下的迁移链接列表', function (done) {
                    var req = {reg: 'any request'};
                    var context = {context: 'any context'};
                    var transitions = {
                        rel1: 'fee',
                        rel2: 'fuu'
                    }
                    var findTransitionsStub = createPromiseStub([resourceId, context, req], [transitions]);
                    //stubs['./StateTransitionsGraph'] = {findTransitions: findTransitionsStub};

                    var feeUrl = '/url/fee';
                    var fuuUrl = '/url/fuu';
                    var getTransitionUrlStub = sinon.stub();
                    getTransitionUrlStub.withArgs('fee', context, req).returns(feeUrl);
                    getTransitionUrlStub.withArgs('fuu', context, req).returns(fuuUrl);

                    resourceRegistry = proxyquire('../netup/rests/ResourceRegistry', stubs);
                    resourceRegistry.setTransitionsFinder({findTransitions: findTransitionsStub});
                    var resource = resourceRegistry.attach(router, resourceId, desc);
                    resource.getTransitionUrl = getTransitionUrlStub;

                    return resource.getLinks(context, req)
                        .then(function (data) {
                            expect(data).eql([
                                {rel: 'rel1', href: feeUrl},
                                {rel: 'rel2', href: fuuUrl}
                            ]);
                            done();
                        })
                });

                it('资源定义错：未定义任何rest服务', function () {
                    delete desc.rests;
                    expect(function () {
                        resourceRegistry.attach(router, resourceId, desc);
                    }).throw('no restful service is defined!');
                });

                it('资源定义错：未定义任何rest服务', function () {
                    desc.rests = [];
                    expect(function () {
                        resourceRegistry.attach(router, resourceId, desc);
                    }).throw('no restful service is defined!');
                });

                it('加载资源时将导致该资源的所有服务被加载', function () {
                    var attachSpy = sinon.spy();
                    stubs['./RestDescriptor'] = {attach: attachSpy};
                    resourceRegistry = proxyquire('../netup/rests/ResourceRegistry', stubs);

                    var resource = resourceRegistry.attach(router, resourceId, desc);
                    expect(attachSpy).calledWith(router, resource, url, restDesc);
                });
            });

        });

        describe('基于express实现', function () {
            describe('组装完整的URL', function () {
                var protocol, getHostStub, reqStub, URL;

                beforeEach(function () {
                    protocol = 'http';
                    getHostStub = sinon.stub();
                    reqStub = {
                        protocol: protocol,
                        get: getHostStub
                    };
                    URL = require('../netup/express/Url');
                });

                it('包含端口号', function () {
                    getHostStub.withArgs('host').returns("www.hotex.com:2341");
                    expect(URL.resolve(reqStub, '/rest/foo')).eql("http://www.hotex.com:2341/rest/foo");
                });

                it('应省略HTTP下的80端口号', function () {
                    getHostStub.withArgs('host').returns("www.hotex.com:80");
                    expect(URL.resolve(reqStub, '/rest/foo')).eql("http://www.hotex.com/rest/foo");
                });
            });

            describe('开发人员可以加载handlebars View engine', function () {
                var viewsDir, viewEngineName, viewEngine, expressApp, appMock;
                var handlebarsEngineCreatorStub;
                var viewsEngineFactory;

                beforeEach(function () {
                    viewsDir = '/views/dir';
                    viewEngineName = 'foo-engine';
                    viewEngine = new Object();
                    expressApp = require('express')();
                    appMock = sinon.mock(expressApp);
                    appMock.expects('set').withExactArgs('views', viewsDir).once();
                    appMock.expects('engine').withExactArgs(viewEngineName, viewEngine).once();
                    appMock.expects('set').withExactArgs('view engine', viewEngineName).once();

                    handlebarsEngineCreatorStub = sinon.stub();
                });

                it('缺省配置', function () {
                    handlebarsEngineCreatorStub
                        .withArgs({
                            partialsDir: viewsDir + '/partials',
                            extname: '.' + viewEngineName
                        })
                        .returns({engine: viewEngine});
                    stubs['express-handlebars'] = {create: handlebarsEngineCreatorStub};

                    viewsEngineFactory = proxyquire('../netup/express/HandlebarsFactory', stubs)(viewEngineName, viewsDir);
                    viewsEngineFactory.attachTo(expressApp);
                    appMock.verify();
                });

                it('设置view partials目录', function () {
                    var partialsDir = '/partials/dir';
                    handlebarsEngineCreatorStub.withArgs({
                        partialsDir: partialsDir,
                        extname: '.' + viewEngineName
                    }).returns({engine: viewEngine});
                    stubs['express-handlebars'] = {create: handlebarsEngineCreatorStub};

                    viewsEngineFactory = proxyquire('../netup/express/HandlebarsFactory', stubs)(viewEngineName, viewsDir, {
                        partialsDir: partialsDir
                    });
                    viewsEngineFactory.attachTo(expressApp);
                    appMock.verify();
                });

                it('设置view文件扩展名', function () {
                    var extname = '.handlebars';
                    handlebarsEngineCreatorStub.withArgs({
                        partialsDir: viewsDir + '/partials',
                        extname: extname
                    }).returns({engine: viewEngine});
                    stubs['express-handlebars'] = {create: handlebarsEngineCreatorStub};

                    viewsEngineFactory = proxyquire('../netup/express/HandlebarsFactory', stubs)(viewEngineName, viewsDir, {
                        extname: extname
                    });
                    viewsEngineFactory.attachTo(expressApp);
                    appMock.verify();
                });

                it('设置helpers', function () {
                    var helpers = new Object();
                    handlebarsEngineCreatorStub.withArgs({
                        partialsDir: viewsDir + '/partials',
                        extname: '.' + viewEngineName,
                        helpers: helpers
                    }).returns({engine: viewEngine});
                    stubs['express-handlebars'] = {create: handlebarsEngineCreatorStub};

                    viewsEngineFactory = proxyquire('../netup/express/HandlebarsFactory', stubs)(viewEngineName, viewsDir, {
                        helpers: helpers
                    });
                    viewsEngineFactory.attachTo(expressApp);
                    appMock.verify();
                });
            });

            describe('AppBuilder', function () {
                var appBaseDir, appBuilder;

                beforeEach(function () {
                    appBaseDir = __dirname;
                    appBuilder = require('../netup/express/AppBuilder').begin(appBaseDir);
                });

                it('设置网站根目录', function (done) {
                    var requestAgent = require('supertest');
                    var app = appBuilder
                        .setWebRoot('/app', './data/website')
                        .end();
                    var request = requestAgent(app);
                    request.get('/app/staticResource.json').expect(200, {name: 'foo'}, done);
                });

                it('开发人员可以加载handlebars View engine', function () {
                    var loadSpy = sinon.spy();
                    var app = appBuilder
                        .setViewEngine({attachTo: loadSpy})
                        .end();
                    expect(loadSpy).calledWith(app).calledOnce;
                });

                it('开发人员可以加载Rest服务', function () {
                    var attachSpy = sinon.spy();
                    var setTransitionsFinderSpy = sinon.spy();
                    var resourceRegistry = {
                        setTransitionsFinder: setTransitionsFinderSpy,
                        attach: attachSpy
                    };

                    var setResourcesNameListSpy = sinon.spy();
                    var resourceTransitionsGraph = {setResourcesNameList: setResourcesNameListSpy};

                    var fooResourceDesc = {foo: 'foo resource desc'};
                    var feeResourceDesc = {fee: 'fee resource desc'};
                    var resources = {
                        foo: fooResourceDesc,
                        fee: feeResourceDesc
                    };

                    var app = appBuilder
                        .setResources(resourceRegistry, resources, resourceTransitionsGraph)
                        .end();

                    expect(setResourcesNameListSpy).calledWith(resourceRegistry);
                    expect(setTransitionsFinderSpy).calledWith(resourceTransitionsGraph);
                    expect(attachSpy).calledWith(app, 'foo', fooResourceDesc);
                    expect(attachSpy).calledWith(app, 'fee', feeResourceDesc);
                });

                describe('运行服务器', function () {
                    const superagent = require('superagent');
                    var server, port;

                    beforeEach(function (done) {
                        port = 3301;
                        appBuilder.setWebRoot('/', './data/website');
                        done();
                    });

                    afterEach(function (done) {
                        server.close(function () {
                            console.log(('and now the server is stoped!'));
                            done();
                        });
                    });

                    function runAndCheckServer(serverPort, url, done) {
                        server = appBuilder
                            .run(serverPort, function () {
                                superagent.get(url)
                                    .end(function (e, res) {
                                        expect(e).eql(null);
                                        expect(res.body.name).eql('foo');
                                        done();
                                    });
                            });

                    }

                    it('运行一个缺省的Server', function (done) {
                        runAndCheckServer(port, 'http://localhost:' + port + '/staticResource.json', done);
                    });

                    it('系统管理员可以通过设置Node.js运行环境变量设定端口号', function (done) {
                        process.env.PORT = port;
                        runAndCheckServer(null, 'http://localhost:' + port + '/staticResource.json', done);
                    });
                });
            });
        });
    });
});

