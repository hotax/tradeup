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
                        "code": "123456",
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
                                },
                                qualityReview: {opinion: "foo opinion"}
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
                    describe('基于消息', function () {
                        describe("销售", function () {
                            var orderId;
                            beforeEach(function () {
                                orderId = "5a29fb9e8fc8ea1de442f6bb";
                            });

                            describe("订单内容存储", function () {
                                var dbSchema, orderRepository;
                                var fooDraftData, fooOrderId, fooVersion, foo;
                                var draftData;

                                beforeEach(function () {
                                    fooDraftData = {
                                        "orderNo": "00001",
                                        "customer": "cust0001",
                                        "items": [
                                            {
                                                "no": "001",
                                                "product": "p0007"
                                            },
                                            {
                                                "no": "002",
                                                "product": "p0008"
                                            }
                                        ],
                                        "sales": "seles0002",
                                        "createDate": new Date(2017, 12, 6).toJSON()
                                    };
                                    dbSchema = require('../server/ANSteel/data/models/salesorder');
                                    return new dbSchema(fooDraftData).save()
                                        .then(function (data) {
                                            fooOrderId = data.id;
                                            fooVersion = data.__v;
                                            foo = data.toJSON();
                                            return orderRepository = require('../server/ANSteel/biz/sales/OrderRepository');
                                        })
                                });

                                it("新增", function () {
                                    draftData = Object.assign({}, fooDraftData);
                                    draftData.orderNo = "feefeefee";
                                    return orderRepository.insert(draftData)
                                        .then(function (data) {
                                            var expected = Object.assign({
                                                id: data.id,
                                                modifiedDate: data.modifiedDate,
                                                __v: data.__v
                                            }, draftData);

                                            expect(data).eql(expected);
                                        })
                                });

                                describe("更新", function () {
                                    it('订单不存在', function () {
                                        return orderRepository.update("5a29fb9e8fc8ea1de442f6bb", {})
                                            .then(function (data) {
                                                expect(data).eql(false);
                                            })
                                    });

                                    it('版本不一致', function () {
                                        return orderRepository.update(fooOrderId, {__v: fooVersion + 1})
                                            .then(function (data) {
                                                expect(data).eql(false);
                                            })
                                    });

                                    it('更新成功', function () {
                                        var no = "ffffff";
                                        var items = [foo.items[1]];
                                        var updatedFoo = Object.assign({}, foo);
                                        updatedFoo.orderNo = no;
                                        updatedFoo.items = items;
                                        return orderRepository.update(fooOrderId, updatedFoo)
                                            .then(function (data) {
                                                expect(data).eql(true);
                                                return dbSchema.findById(fooOrderId);
                                            })
                                            .then(function (data) {
                                                data = data.toJSON();
                                                expect(data.__v).not.eql(updatedFoo.__v);
                                                delete data.__v;
                                                delete updatedFoo.__v;
                                                expect(data).eql(updatedFoo);
                                            })
                                    })
                                });

                                describe("删除", function () {
                                    it('订单不存在', function () {
                                        return orderRepository.delete("5a29fb9e8fc8ea1de442f6bb", fooVersion)
                                            .then(function (data) {
                                                expect(data).eql(false);
                                            })
                                    });

                                    it('版本不一致', function () {
                                        return orderRepository.delete(fooOrderId, fooVersion + 1)
                                            .then(function (data) {
                                                expect(data).eql(false);
                                            })
                                    });

                                    it('成功', function () {
                                        return orderRepository.delete(fooOrderId, fooVersion)
                                            .then(function (data) {
                                                expect(data).eql(true);
                                                return dbSchema.findById(fooOrderId);
                                            })
                                            .then(function (data) {
                                                expect(data).null;
                                            })
                                    })
                                });

                                describe("查询", function () {
                                    it('订单不存在', function () {
                                        return orderRepository.findById("5a29fb9e8fc8ea1de442f6bb")
                                            .then(function (data) {
                                                expect(data).null;
                                            })
                                    });

                                    it('成功', function () {
                                        return orderRepository.findById(fooOrderId)
                                            .then(function (data) {
                                                expect(data).eql(foo);
                                            })
                                    })
                                });

                                describe("检查当前版本", function () {
                                    it('订单不存在', function () {
                                        return orderRepository.checkVersion("5a29fb9e8fc8ea1de442f6bb", fooVersion)
                                            .then(function (data) {
                                                expect(data).eql(false);
                                            })
                                    });

                                    it('版本不一致', function () {
                                        return orderRepository.checkVersion(fooOrderId, fooVersion + 1)
                                            .then(function (data) {
                                                expect(data).eql(false);
                                            })
                                    });

                                    it('当前版本存在', function () {
                                        return orderRepository.checkVersion(fooOrderId, fooVersion)
                                            .then(function (data) {
                                                expect(data).eql(true);
                                            })
                                    })
                                });
                            });

                            describe("订单状态存储", function () {
                                var dbSchema, orderStateRepository;
                                var anotherOrderId, state;
                                beforeEach(function () {
                                    state = "foostate";
                                    anotherOrderId = "5a29fb9e8fc8ea1de442f6bc";
                                    dbSchema = require('../server/ANSteel/data/models/orderState');
                                    return new dbSchema({
                                        order: orderId,
                                        state: state
                                    }).save()
                                        .then(function (data) {
                                            orderStateRepository = require('../server/ANSteel/biz/sales/OrderStateRepository');
                                        })
                                });

                                describe('保存初始状态', function () {
                                    it("保存失败 - 状态冲突", function () {
                                        return orderStateRepository.init(orderId, "otherstate")
                                            .then(function () {
                                                throw "test failed";
                                            })
                                            .catch(function (reason) {
                                                expect(reason).eql(orderStateRepository.REASON_CONFLICT);
                                            })
                                    });

                                    it("已存在该订单状态", function () {
                                        return orderStateRepository.init(orderId, state)
                                            .then(function (data) {
                                                expect(data).eql({
                                                    order: orderId,
                                                    state: state
                                                });
                                            })
                                    });

                                    it("保存新订单状态成功", function () {
                                        return orderStateRepository.init(anotherOrderId, state)
                                            .then(function (data) {
                                                expect(data).eql({
                                                    order: anotherOrderId,
                                                    state: state
                                                });
                                            })
                                    });
                                });

                                describe("更新", function () {
                                    var newState;
                                    beforeEach(function () {
                                        newState = "newstate";
                                    });

                                    it('订单不存在', function () {
                                        return orderStateRepository.update(anotherOrderId, newState)
                                            .then(function (data) {
                                                throw "test failed";
                                            })
                                            .catch(function (reason) {
                                                expect(reason).eql(orderStateRepository.REASON_NOT_FOUND);
                                            })
                                    });

                                    it('状态不一致', function () {
                                        return orderStateRepository.update(anotherOrderId, newState, "otherstate")
                                            .then(function (data) {
                                                throw "test failed";
                                            })
                                            .catch(function (reason) {
                                                expect(reason).eql(orderStateRepository.REASON_NOT_FOUND);
                                            })
                                    });

                                    it('更新成功', function () {
                                        var newState = "newstate";
                                        return orderStateRepository.update(orderId, newState, state)
                                            .then(function (data) {
                                                expect(data).not.null;
                                            })
                                    })
                                });

                                it("删除", function () {
                                    return orderStateRepository.delete(orderId)
                                        .then(function (data) {
                                            expect(data).not.null;
                                            return dbSchema.findOne({order: orderId});
                                        })
                                        .then(function (data) {
                                            expect(data).null;
                                        })
                                });

                                describe("查询指定订单状态", function () {
                                    it("未找到指定订单状态", function () {
                                        return orderStateRepository.getState(anotherOrderId)
                                            .then(function (data) {
                                                expect(data).null;
                                            })
                                    });

                                    it("查询成功", function () {
                                        return orderStateRepository.getState(orderId)
                                            .then(function (data) {
                                                expect(data).eql(state);
                                            })
                                    });
                                });

                                it("列出指定状态的所有订单", function () {
                                    return orderStateRepository.listByState(state)
                                        .then(function (data) {
                                            expect(data).eql([{
                                                order: orderId
                                            }])
                                        })
                                });
                            });

                            it("订单表述", function () {
                                var orderRepresentation = require("../server/ANSteel/biz/sales/OrderRepresentation");
                                var content = {content: "order content"};
                                var state = "order state";
                                expect(orderRepresentation.compose(content, state)).eql({
                                    content: "order content",
                                    state: state
                                });
                            });

                            describe("订单生命周期", function () {
                                var salesOrderLifecycle, stateResitoryStub;
                                var state;
                                beforeEach(function () {
                                    stateResitoryStub = sinon.stub({
                                        create: function (id, state) {
                                        },
                                        getState: function (id) {
                                        },
                                        update: function (id, state, oldstate) {
                                        },
                                        listByState: function (state) {
                                        }
                                    });
                                    salesOrderLifecycle = require('../server/ANSteel/biz/sales/OrderLifeCycle')(stateResitoryStub)
                                    state = salesOrderLifecycle.DRAFT;
                                });

                                it("接纳订单草稿", function () {
                                    stateResitoryStub.create.withArgs(orderId, state).returns(Promise.resolve());
                                    return salesOrderLifecycle.acceptDraft(orderId)
                                        .then(function (data) {
                                            expect(data).eql(state);
                                        })
                                });

                                it("提交订单草稿", function () {
                                    stateResitoryStub.update.withArgs(orderId, salesOrderLifecycle.BIZREVIEW, salesOrderLifecycle.DRAFT).returns(Promise.resolve());
                                    return salesOrderLifecycle.submitDraft(orderId)
                                        .then(function (data) {
                                            expect(data).eql(salesOrderLifecycle.BIZREVIEW);
                                        })
                                });

                                describe("查询特定状态下的所有订单", function () {
                                    function testListOrdersUnderState(service, state) {
                                        console.info("service: " + service + "   state: " + state);
                                        var result = [{order: "12345"}, {order: "23456"}];
                                        stateResitoryStub.listByState.withArgs(state)
                                            .returns(Promise.resolve(result));
                                        return salesOrderLifecycle["list" + service]()
                                            .then(function (data) {
                                                expect(data).eql(result);
                                            })
                                    }

                                    it("查询特定状态下的所有订单", function () {
                                        var allServicesAndStates = [
                                            {service: "Drafts", state: salesOrderLifecycle.DRAFT},
                                            {service: "BizReview", state: salesOrderLifecycle.BIZREVIEW},
                                            {service: "FinacialReview", state: salesOrderLifecycle.FINACIALREVIEW},
                                            {service: "Executing", state: salesOrderLifecycle.EXECUTING},
                                            {service: "Stop", state: salesOrderLifecycle.STOP},
                                            {service: "Cleared", state: salesOrderLifecycle.CLEARED}
                                        ];
                                        Promise.all(allServicesAndStates.map(function (item) {
                                            return testListOrdersUnderState(item.service, item.state);
                                        }))
                                            .then(function (data) {
                                                expect(data).undefined;
                                            })
                                    })
                                })
                            });

                            describe("订单草拟阶段", function () {
                                var orderDrafting, helperStub;
                                var orderId;
                                beforeEach(function () {
                                    helperStub = sinon.stub({
                                        create: function (draft) {
                                        },
                                        findById: function (id) {
                                        },
                                        entryLifecycle: function (id) {
                                        },
                                        dealWithEvent: function (event) {
                                        },
                                        list: function () {
                                        }
                                    });
                                    orderDrafting = require('../server/ANSteel/biz/sales/OrderDrafting')(helperStub);
                                    orderId = "123456";
                                });

                                it("列出当前所有订单草稿", function () {
                                    var fooid = "12345";
                                    var feeid = "23456";
                                    helperStub.list.returns(Promise.resolve([fooid, feeid]));
                                    var fooDraft = {draft: "foo"};
                                    var feeDraft = {draft: "fee"};
                                    helperStub.findById.withArgs(fooid).returns(Promise.resolve(fooDraft));
                                    helperStub.findById.withArgs(feeid).returns(Promise.resolve(feeDraft));

                                    return orderDrafting.listDrafts()
                                        .then(function (data) {
                                            expect(data).eql([fooDraft, feeDraft]);
                                        })
                                });

                                describe("草拟订单", function () {
                                    var draft, reason;
                                    beforeEach(function () {
                                        draft = {draft: "any order draft content"};
                                        reason = {reason: "any reason"};
                                    });

                                    it("创建订单失败", function () {
                                        helperStub.create.withArgs(draft).returns(Promise.reject(reason));
                                        return orderDrafting.draft(draft)
                                            .then(function () {
                                                throw "test failed";
                                            })
                                            .catch(function (data) {
                                                expect(data).eql(reason);
                                            })
                                    });

                                    it("设置订单初始状态失败", function () {
                                        var orderId = "123344";
                                        var order = {id: orderId};
                                        helperStub.create.withArgs(draft).returns(Promise.resolve(order));
                                        helperStub.entryLifecycle.withArgs(orderId).returns(Promise.reject(reason));
                                        return orderDrafting.draft(draft)
                                            .then(function () {
                                                throw "test failed";
                                            })
                                            .catch(function (data) {
                                                expect(data).eql(reason);
                                            })
                                    });

                                    it("草拟订单成功", function () {
                                        var orderId = "123344";
                                        var order = {id: orderId};
                                        helperStub.create.withArgs(draft).returns(Promise.resolve(order));
                                        var state = {state: "the state"};
                                        var expectedOrder = Object.assign({state: state}, order);
                                        helperStub.entryLifecycle.withArgs(orderId).returns(Promise.resolve(state));
                                        return orderDrafting.draft(draft)
                                            .then(function (data) {
                                                expect(data).eql(expectedOrder);
                                            })
                                    });
                                });

                                it("修改订单", function () {
                                    var draft = {draft: "draft content includeing to be updated"};
                                    var event = {
                                        name: "modify",
                                        source: orderId,
                                        data: draft
                                    };
                                    helperStub.dealWithEvent = sinon.spy();
                                    return orderDrafting.update(orderId, draft)
                                        .then(function () {
                                            expect(helperStub.dealWithEvent).calledWith(event).calledOnce;
                                        })
                                });

                                it("删除订单", function () {
                                    var event = {
                                        name: "delete",
                                        source: orderId
                                    };
                                    helperStub.dealWithEvent = sinon.spy();
                                    return orderDrafting.delete(orderId)
                                        .then(function () {
                                            expect(helperStub.dealWithEvent).calledWith(event).calledOnce;
                                        })
                                });

                                it("提交订单草稿", function () {
                                    var event = {
                                        name: "submit",
                                        source: orderId
                                    };
                                    helperStub.dealWithEvent = sinon.spy();
                                    return orderDrafting.submit(orderId)
                                        .then(function () {
                                            expect(helperStub.dealWithEvent).calledWith(event).calledOnce;
                                        })
                                });
                            });

                            describe("商务评审", function () {
                            });

                            describe("财务评审", function () {
                            });

                            describe("订单执行", function () {
                            });

                            describe("销售订单管理", function () {
                                var orderManagement, stateStub, contentStub, representStub;
                                beforeEach(function () {
                                    stateStub = sinon.stub({
                                        getState: function (id) {
                                        }
                                    });
                                    contentStub = sinon.stub({
                                        findById: function (id) {
                                        }
                                    });
                                    representStub = sinon.stub({
                                        compose: function (content, state) {
                                        }
                                    });

                                    orderManagement = require('../server/ANSteel/biz/sales/OrderManagement')
                                    (stateStub, contentStub, representStub);
                                });

                                describe("查询订单详情", function () {
                                    var idStateNotFount, idContentNotFount;
                                    var stateReason, contentReason;
                                    var state, content, representation;
                                    beforeEach(function () {
                                        state = "any state";
                                        content = {content: "any content"};
                                        representation = {representation: "order representation"};
                                        representStub.compose.withArgs(content, state).returns(representation);
                                    });

                                    it("未找到指定订单", function () {
                                        stateStub.getState.withArgs(orderId).returns(Promise.resolve(null));
                                        contentStub.findById.withArgs(orderId).returns(Promise.resolve(null));
                                        return orderManagement.findById(orderId)
                                            .then(function (data) {
                                                expect(data).null;
                                            })
                                    });

                                    it("内部数据不一致--未找到订单状态", function () {
                                        stateStub.getState.withArgs(orderId).returns(Promise.resolve(null));
                                        contentStub.findById.withArgs(orderId).returns(Promise.resolve(content));
                                        return orderManagement.findById(orderId)
                                            .then(function () {
                                                throw "test failed";
                                            })
                                            .catch(function (data) {
                                                expect(data).eql(orderManagement.REASON_INTERNAL_DATA_ERROR);
                                            })
                                    });

                                    it("内部数据不一致--未找到订单内容", function () {
                                        stateStub.getState.withArgs(orderId).returns(Promise.resolve(state));
                                        contentStub.findById.withArgs(orderId).returns(Promise.resolve(null));
                                        return orderManagement.findById(orderId)
                                            .then(function () {
                                                throw "test failed";
                                            })
                                            .catch(function (data) {
                                                expect(data).eql(orderManagement.REASON_INTERNAL_DATA_ERROR);
                                            })
                                    });

                                    it("查询订单成功", function () {
                                        stateStub.getState.withArgs(orderId).returns(Promise.resolve(state));
                                        contentStub.findById.withArgs(orderId).returns(Promise.resolve(content));
                                        return orderManagement.findById(orderId)
                                            .then(function (data) {
                                                expect(data).eql(representation);
                                            })
                                    });
                                });

                            });
                        });

                        describe("质量", function () {
                        });

                        describe("财务", function () {

                        });

                        describe("生产线", function () {

                        });

                        describe("成品库", function () {

                        });

                        describe("运输", function () {

                        });
                    });

                    describe('销售订单', function () {
                        var salesOrders, orderModel, unknownId;

                        beforeEach(function () {
                            unknownId = '5a122f18d1eb023b18a9cda2';
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
                                        expect(data.id).undefined;
                                        expect(data.orderNo).eql(orderInDb.orderNo);
                                        expect(data.modifiedDate).eql(orderInDb.modifiedDate.toJSON());
                                        expect(data.__v).eql(orderInDb.__v);
                                    })
                            })
                        });

                        describe('列出所有订单草稿', function () {
                            var foo, fooid, fooCreateDate;
                            var fee, feeid, feeCreateDate;
                            var fuu, fuuid, fuuCreateDate;

                            beforeEach(function () {
                                fooCreateDate = new Date(2017, 11, 15).toJSON();
                                feeCreateDate = new Date(2017, 11, 16).toJSON();
                                fuuCreateDate = new Date(2017, 11, 17).toJSON();
                                foo = {orderNo: "foo", createDate: fooCreateDate};
                                fee = {orderNo: "fee", review: {quality: false}, createDate: feeCreateDate};
                                fuu = {orderNo: "fuu", review: {quality: true}, createDate: fuuCreateDate};
                                return new orderModel(foo).save()
                                    .then(function (model) {
                                        fooid = model.id;
                                        return new orderModel(fee).save()
                                    })
                                    .then(function (model) {
                                        feeid = model.id;
                                        return new orderModel(fuu).save()
                                    })
                                    .then(function (model) {
                                        fuuid = model.id;
                                    })
                            });

                            it('全部列出', function () {
                                return salesOrders.listDrafts()
                                    .then(function (list) {
                                        delete list.items[0].id;
                                        list.items[0].review = fuu.review;
                                        delete list.items[1].id;
                                        list.items[1].review = fee.review;
                                        delete list.items[2].id;
                                        expect(list).eql({"items": [fuu, fee, foo]});
                                    });
                            });
                        });

                        describe('列出所有送交质量评审的订单草稿', function () {
                            var foo, fooid, fooCreateDate;
                            var fee, fuu, feeid, feeCreateDate;

                            beforeEach(function () {
                                fooCreateDate = new Date(2017, 11, 15).toJSON();
                                feeCreateDate = new Date(2017, 11, 16).toJSON();
                                foo = {orderNo: "foo", createDate: fooCreateDate};
                                fee = {orderNo: "fee", review: {quality: false}, createDate: feeCreateDate};
                                fuu = {orderNo: "fuu", review: {quality: true}, createDate: feeCreateDate};
                                return new orderModel(foo).save()
                                    .then(function (model) {
                                        fooid = model.id;
                                        return new orderModel(fee).save()
                                            .then(function (model) {
                                                feeid = model.id;
                                                return new orderModel(fuu).save()
                                            })
                                    })
                            });

                            it('全部列出', function () {
                                return salesOrders.listDraftsForQualityReview()
                                    .then(function (list) {
                                        delete list.items[0].id;
                                        delete list.items[1].id;
                                        delete fee.review;
                                        expect(list).eql({"items": [fee, foo]});
                                    });
                            });
                        });

                        describe('按标识读取用于质量评审的订单草稿', function () {
                            var orderInDb, id;

                            beforeEach(function () {
                            });

                            it('正确读取', function () {
                                return new orderModel(fooSampleDraftOrder).save()
                                    .then(function (model) {
                                        orderInDb = model;
                                        id = orderInDb.id;
                                        return salesOrders.findDraftForQualityReview(id);
                                    })
                                    .then(function (data) {
                                        expect(data.id).undefined;
                                        expect(data.modifiedDate).eql(orderInDb.modifiedDate.toJSON());
                                        expect(data.__v).eql(orderInDb.__v);
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
                                                    "from": new Date(2018, 11, 1).toJSON(),
                                                    "to": new Date(2018, 11, 30).toJSON()
                                                },
                                                "qualityReview": {
                                                    "opinion": "foo opinion"
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
                                                    "from": new Date(2018, 12, 1).toJSON(),
                                                    "to": new Date(2018, 12, 31).toJSON()
                                                }
                                            }
                                        ]);
                                    })
                            });

                            it('排除已经完成质量评审的订单', function () {
                                fooSampleDraftOrder.review = {quality: true};
                                return new orderModel(fooSampleDraftOrder).save()
                                    .then(function (model) {
                                        return salesOrders.findDraftForQualityReview(model.id);
                                    })
                                    .then(function (data) {
                                        return Promise.reject();
                                    })
                                    .catch(function (err) {
                                        expect(err).eql("Not-Found");
                                    })
                            })
                        });

                        describe("质量评审", function () {
                            var orderInDb, reviewData;

                            beforeEach(function () {
                                return new orderModel(fooSampleDraftOrder).save()
                                    .then(function (model) {
                                        orderInDb = model;
                                        reviewData = {
                                            orderNo: fooSampleDraftOrder.orderNo,
                                            productLine: fooSampleDraftOrder.productLine,
                                            items: [
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
                                                        "from": new Date(2018, 11, 1).toJSON(),
                                                        "to": new Date(2018, 11, 30).toJSON()
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
                                                        "from": new Date(2018, 12, 1).toJSON(),
                                                        "to": new Date(2018, 12, 31).toJSON()
                                                    }
                                                }
                                            ],
                                            modifiedDate: orderInDb.modifiedDate.toJSON(),
                                            __v: orderInDb.__v
                                        }
                                    })
                            });

                            describe("版本检查", function () {
                                it("版本检查-未找到文档", function () {
                                    return salesOrders.checkVersion(unknownId, orderInDb.__v)
                                        .then(function (exist) {
                                            expect(exist).eql(false);
                                        })
                                });

                                it("版本检查-版本不符", function () {
                                    return salesOrders.checkVersion(orderInDb.id, -1)
                                        .then(function (exist) {
                                            expect(exist).eql(false);
                                        })
                                });

                                it("通过版本检查", function () {
                                    return salesOrders.checkVersion(orderInDb.id, orderInDb.__v)
                                        .then(function (exist) {
                                            expect(exist).eql(true);
                                        })
                                });
                            });

                            describe("更新评审内容", function () {
                                it("未找到文档", function () {
                                    return salesOrders.draftQualityReview(unknownId)
                                        .catch(function (err) {
                                            expect(err).eql("Not-Found");
                                        })
                                });

                                it("文档状态不一致", function () {
                                    reviewData.items[0].qty.value = 100;
                                    return salesOrders.draftQualityReview(orderInDb.id, reviewData)
                                        .catch(function (err) {
                                            expect(err).eql("Concurrent-Conflict");
                                        })
                                });

                                it("无新的评审内容需要更新", function () {
                                    reviewData.items[0].qualityReview = {
                                        "opinion": "foo opinion"
                                    };
                                    return salesOrders.draftQualityReview(orderInDb.id, reviewData)
                                        .catch(function (err) {
                                            expect(err).eql("Nothing");
                                        })
                                });

                                it("正确提交评审", function () {
                                    var qualityReview = {
                                        "opinion": "foo opinion something changed ...."
                                    };
                                    reviewData.items[0].qualityReview = qualityReview;
                                    var updateResult;
                                    return salesOrders.draftQualityReview(orderInDb.id, reviewData)
                                        .then(function (data) {
                                            updateResult = data;
                                            return orderModel.findById(orderInDb.id);
                                        })
                                        .then(function (data) {
                                            expect(data.orderNo).eql(orderInDb.orderNo);
                                            expect(data.__v).not.eql(orderInDb.__v);
                                            expect(data.__v).eql(updateResult.__v);
                                            expect(data.modifiedDate).not.eql(orderInDb.modifiedDate);
                                            expect(data.modifiedDate).eql(updateResult.modifiedDate);
                                            expect(data.items[0].qualityReview.toJSON())
                                                .eql(qualityReview);
                                        })
                                });
                            });
                        });

                        describe("完成评审", function () {
                            var orderInDb;

                            beforeEach(function () {
                                return new orderModel(fooSampleDraftOrder).save()
                                    .then(function (model) {
                                        orderInDb = model;
                                    })
                            });

                            it("文档状态不一致", function () {
                                return salesOrders.fulfillQualityReview(orderInDb.id, -1)
                                    .then(function () {
                                        return Promise.reject();
                                    })
                                    .catch(function (reason) {
                                        expect(reason).eql("Concurrent-Conflict");
                                    })
                            });

                            it("完成质量评审", function () {
                                return salesOrders.fulfillQualityReview(orderInDb.id, orderInDb.__v)
                                    .then(function (data) {
                                        expect(data).undefined;
                                        return orderModel.findById(orderInDb.id, "review modifiedDate __v")
                                    })
                                    .then(function (data) {
                                        expect(data.review.quality).true;
                                        expect(data.modifiedDate).not.eql(orderInDb.modifiedDate);
                                        expect(data.__v).not.eql(orderInDb.__v);
                                    })
                            });
                        })
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

                describe('订单质量评审人员需要能够获得评审材料', function () {
                    var salesOrders;
                    beforeEach(function () {
                        salesOrders = {
                            findDraftForQualityReview: function (id) {
                            }
                        };
                        salesOrders = sinon.stub(salesOrders);
                        stubs['../biz/sales/SalesOrders'] = salesOrders;
                        handler = proxyquire('../server/ANSteel/rests/DraftOrderForQualityReview', stubs).rests[0].handler;
                    });

                    it('成功获得指定的订单质量评审材料', function () {
                        var orderId = '4355rffss';
                        var order = {order: 'any order data'};
                        req = {
                            params: {
                                id: orderId
                            }
                        };
                        salesOrders.findDraftForQualityReview.withArgs(orderId).returns(Promise.resolve(order));
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
                    var resourceId, handlerStub, objRead, version, modifiedDate;
                    beforeEach(function () {
                        resourceId = "fuuuu";
                        version = "123456";
                        modifiedDate = new Date(2017, 10, 10).toJSON();
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
                            modifiedDate: modifiedDate,
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
                        representedObject.modifiedDate = modifiedDate;
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
                            .expect('Last-Modified', modifiedDate)
                            .expect(200, representation, done)
                    });

                    it('未找到资源', function (done) {
                        handlerStub.returns(Promise.reject("Not-Found"));
                        restDescriptor.attach(app, currentResource, url, desc);
                        request.get(url)
                            .expect(404, done);
                    });

                    it('未知错误返回500内部错', function (done) {
                        handlerStub.returns(Promise.reject(err));
                        restDescriptor.attach(app, currentResource, url, desc);
                        request.get(url)
                            .expect(500, err, done);
                    });
                });

                describe('更新服务', function () {
                    var handler, id, version, body, doc, modifiedDate;
                    beforeEach(function () {
                        handler = sinon.stub({
                            condition: function (id, version) {
                            },
                            handle: function (doc, body) {
                            }
                        });
                        desc = {
                            type: 'update',
                            handler: handler
                        };
                        url = "/url/:id";
                        id = "foo";
                        version = "12345df";
                        modifiedDate = new Date(2017, 11, 11);
                        body = {body: "any data to update"};
                        doc = {doc: "doc identified by id"};
                        restDescriptor.attach(app, currentResource, url, desc);
                    });

                    it('请求中未包含条件', function (done) {
                        desc.conditional = true;
                        request.put("/url/" + id)
                            .expect(403, "client must send a conditional request", done);
                    });

                    it('不满足请求条件', function (done) {
                        handler.condition.withArgs(id, version).returns(Promise.resolve(false));
                        request.put("/url/" + id)
                            .set("If-Match", version)
                            .expect(412, done);
                    });

                    it('满足请求条件, 但handle未返回任何资源最新状态控制信息', function (done) {
                        handler.condition.withArgs(id, version).returns(Promise.resolve(true));
                        err = "handler did not promise any state version info ....";
                        handler.handle.withArgs(id, body).returns(Promise.resolve({}));
                        request.put("/url/" + id)
                            .set("If-Match", version)
                            .send(body)
                            .expect(500, err, done);
                    });

                    it('满足请求条件, 并正确响应', function (done) {
                        handler.condition.withArgs(id, version).returns(Promise.resolve(true));
                        handler.handle.returns(Promise.resolve({
                            __v: version,
                            modifiedDate: modifiedDate
                        }));
                        request.put("/url/" + id)
                            .set("If-Match", version)
                            .send(body)
                            .expect("ETag", version)
                            .expect("Last-Modified", modifiedDate.toJSON())
                            .expect(204, done);
                    });

                    it('未找到文档', function (done) {
                        var reason = "Not-Found";
                        handler.handle.withArgs(id, body).returns(Promise.reject(reason));
                        request.put("/url/" + id)
                            .send(body)
                            .expect(404, done);
                    });

                    it("文档状态不一致", function (done) {
                        var reason = "Concurrent-Conflict";
                        handler.handle.withArgs(id, body).returns(Promise.reject(reason));
                        request.put("/url/" + id)
                            .send(body)
                            .expect(304, done);
                    });

                    it("无新的评审内容需要更新", function (done) {
                        var reason = "Nothing";
                        handler.handle.withArgs(id, body).returns(Promise.reject(reason));
                        request.put("/url/" + id)
                            .send(body)
                            .expect(204, done);
                    });

                    it('响应更新失败', function (done) {
                        var reason = "conflict";
                        desc.response = {
                            conflict: {
                                code: 409,
                                err: "here is the cause"
                            }
                        };
                        handler.handle.withArgs(id, body).returns(Promise.reject(reason));
                        request.put("/url/" + id)
                            .send(body)
                            .expect(409, "here is the cause", done);
                    });

                    it('无请求条件, 正确响应', function (done) {
                        handler.handle.withArgs(id, body).returns(Promise.resolve({
                            __v: version,
                            modifiedDate: modifiedDate
                        }));
                        request.put("/url/" + id)
                            .send(body)
                            .expect("ETag", version)
                            .expect("Last-Modified", modifiedDate.toJSON())
                            .expect(204, done);
                    });

                    it('未能识别的错误返回500内部错', function (done) {
                        err = "foo";
                        handler.handle.returns(Promise.reject(err));
                        request.put(url)
                            .expect(500, err, done);
                    });
                });

                describe('删除服务', function () {
                    var handler, id, version;
                    beforeEach(function () {
                        handler = sinon.stub({
                            condition: function (id, version) {
                            },
                            handle: function (id, version) {
                            }
                        });
                        desc = {
                            type: 'delete',
                            handler: handler
                        };
                        url = "/url/:id";
                        id = "foo";
                        version = "12345df";
                        restDescriptor.attach(app, currentResource, url, desc);
                    });

                    it('请求中未包含条件', function (done) {
                        desc.conditional = true;
                        request.delete("/url/" + id)
                            .expect(403, "client must send a conditional request", done);
                    });

                    it('不满足请求条件', function (done) {
                        handler.condition.withArgs(id, version).returns(Promise.resolve(false));
                        request.delete("/url/" + id)
                            .set("If-Match", version)
                            .expect(412, done);
                    });

                    it('满足请求条件, 但handle处理失败', function (done) {
                        var reason = "conflict";
                        err = "details of conflicts";
                        desc.response = {
                            conflict: {
                                code: 409,
                                err: err
                            }
                        };
                        handler.condition.withArgs(id, version).returns(Promise.resolve(true));
                        handler.handle.withArgs(id, version).returns(Promise.reject(reason));
                        request.delete("/url/" + id)
                            .set("If-Match", version)
                            .expect(409, err, done);
                    });

                    it('满足请求条件, 并正确响应', function (done) {
                        handler.condition.withArgs(id, version).returns(Promise.resolve(true));
                        handler.handle.returns(Promise.resolve());
                        request.delete("/url/" + id)
                            .set("If-Match", version)
                            .expect(204, done);
                    });

                    it('未找到文档', function (done) {
                        var reason = "Not-Found";
                        handler.handle.withArgs(id).returns(Promise.reject(reason));
                        request.delete("/url/" + id)
                            .expect(404, done);
                    });

                    it('正确响应', function (done) {
                        handler.handle.withArgs(id).returns(Promise.resolve());
                        request.delete("/url/" + id)
                            .expect(204, done);
                    });

                    it('响应删除失败', function (done) {
                        var reason = "conflict";
                        err = "details of conflicts";
                        desc.response = {
                            conflict: {
                                code: 409
                            }
                        };
                        //TODO:对于在服务定义中定义的出错处理应重构
                        handler.handle.withArgs(id).returns(Promise.reject(reason));
                        request.delete("/url/" + id)
                            .expect(409, reason, done);
                    });

                    it('未能识别的错误返回500内部错', function (done) {
                        err = "foo";
                        handler.handle.withArgs(id).returns(Promise.reject(err));
                        request.delete("/url/" + id)
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
                });

                it('构建从一个资源迁移到另一个资源的URL', function () {
                    var fooDesc = {
                        url: '/url/foo',
                        rests: [restDesc]
                    };
                    var feeDesc = {
                        url: '/url/fee',
                        rests: [restDesc]
                    };

                    var req = {
                        params: {},
                        query: {}
                    }

                    var expectedUrl = "/expected/url";
                    var urlResolveStub = sinon.stub();
                    urlResolveStub.withArgs(req, '/url/fee').returns(expectedUrl);
                    stubs['../express/Url'] = {resolve: urlResolveStub};
                    resourceRegistry = proxyquire('../netup/rests/ResourceRegistry', stubs);

                    var fooResource = resourceRegistry.attach(router, 'foo', fooDesc);
                    resourceRegistry.attach(router, 'fee', fooDesc);
                    resourceRegistry.attach(router, 'fee', feeDesc);
                    resourceRegistry.getTransitionUrl("foo", "fee", context, req);
                });

                it('获得当前资源状态下的迁移链接列表', function () {
                    var req = {reg: 'any request'};
                    var context = {context: 'any context'};
                    var links = [{rel: "foo", href: "/foo"}, {rel: "fee", href: "/fee"}];
                    var getLinksStub = createPromiseStub([resourceId, context, req], [links]);

                    resourceRegistry = require('../netup/rests/ResourceRegistry');
                    resourceRegistry.setTransitionGraph({getLinks: getLinksStub});
                    var resource = resourceRegistry.attach(router, resourceId, desc);

                    return resource.getLinks(context, req)
                        .then(function (data) {
                            expect(data).eql(links);
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

            describe("基本的资源状态迁移图解析器", function () {
                var context, req, transitionGraph;
                var fooUrl, feeUrl;
                var getTransitionUrlStub, transitionGraphFactory, transitionGraphParser;
                var transCondStub;

                beforeEach(function () {
                    context = {context: "any context"};
                    req = {req: "any request object"};
                    transitionGraph = {
                        resource1: {
                            rel1: "foo",
                            rel2: "fee"
                        },
                        resource2: {
                            rel3: "fuu"
                        }
                    };

                    fooUrl = '/url/foo';
                    feeUrl = '/url/fee';
                    getTransitionUrlStub = sinon.stub();
                    getTransitionUrlStub.withArgs("resource1", 'foo', context, req).returns(fooUrl);
                    getTransitionUrlStub.withArgs("resource1", 'fee', context, req).returns(feeUrl);

                    transitionGraphFactory = require("../netup/rests/BaseTransitionGraph");
                    transitionGraphParser = transitionGraphFactory(transitionGraph, {
                        getTransitionUrl: getTransitionUrlStub
                    });
                    transCondStub = sinon.stub();
                });

                it("最简单的迁移定义", function () {
                    return transitionGraphParser.getLinks("resource1", context, req)
                        .then(function (data) {
                            expect(data).eql([
                                {rel: "rel1", href: fooUrl},
                                {rel: "rel2", href: feeUrl},
                            ])
                        })
                });

                it("未满足迁移条件", function () {
                    transCondStub.withArgs(context, req).returns(false);
                    transitionGraph.resource1.rel2 = {
                        id: "fee",
                        condition: transCondStub
                    };

                    return transitionGraphParser.getLinks("resource1", context, req)
                        .then(function (data) {
                            expect(data).eql([
                                {rel: "rel1", href: fooUrl}
                            ])
                        })
                });

                it("满足迁移条件", function () {
                    transCondStub.withArgs(context, req).returns(true);
                    transitionGraph.resource1.rel2 = {
                        id: "fee",
                        condition: transCondStub
                    };

                    return transitionGraphParser.getLinks("resource1", context, req)
                        .then(function (data) {
                            expect(data).eql([
                                {rel: "rel1", href: fooUrl},
                                {rel: "rel2", href: feeUrl}
                            ])
                        })
                });
            })

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
                    var resourceRegistry = {
                        attach: attachSpy
                    };

                    var fooResourceDesc = {foo: 'foo resource desc'};
                    var feeResourceDesc = {fee: 'fee resource desc'};
                    var resources = {
                        foo: fooResourceDesc,
                        fee: feeResourceDesc
                    };

                    var app = appBuilder
                        .setResources(resourceRegistry, resources)
                        .end();

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

        describe("消息", function () {
            xdescribe("演示", function () {
                var amqp, connstr, connection, channel, queue;
                before(function () {
                    connstr = "amqp://qladapfm:CjtgA21O-1Ux-L108UCR70TcJ4GDpRVh@spider.rmq.cloudamqp.com/qladapfm";
                    amqp = require('amqplib');

                    return amqp.connect(connstr)
                        .then(function (conn) {
                            connection = conn;
                            conn.on("close", function () {
                                console.error("[AMQP] connection is closed");
                            });
                            return conn.createChannel();
                        })
                        .then(function (ch) {
                            channel = ch;
                            return Promise.all([
                                ch.assertQueue('qualityReview'),
                                ch.assertExchange('orderDrafted', 'fanout'),
                                ch.bindQueue('qualityReview', 'orderDrafted')
                            ]);
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                });

                after(function () {
                    return connection.close()
                        .then(function () {
                        })
                });

                afterEach(function () {
                    return channel.purgeQueue('qualityReview')
                        .then(function (count) {
                            console.info("messages count: " + count.messageCount);
                        })
                });

                it("Hello world", function () {
                    return Promise.resolve()
                        .then(function () {
                            return channel.consume('qualityReview', function (msg) {
                                var content = msg.content.toString();
                                console.log(" [x] Received " + content);
                                return channel.ack(msg);
                            });
                        })
                        .then(function () {
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                });
            });
        });

        describe("生命周期", function () {
            var lifecycleFactory, stateRepositoryStub;
            var fsm, lifecycle, event, source, data, handlerSpy, currentState;
            beforeEach(function () {
                stateRepositoryStub = sinon.stub({
                    init: function (source, state) {
                    },
                    current:function (source) {
                    },
                    update:function (source, state) {
                    }
                });
                lifecycleFactory = require("../netup/app/Lifecycle")(stateRepositoryStub);

                handlerSpy = sinon.spy();
                currentState = "draft";
                source = "foo";
                data = {data: "any data"};
                event = {
                    source: source,
                    data: data
                }
            });

            it("进入生命周期", function () {
                fsm = {
                    init: "s1"
                };
                lifecycle = lifecycleFactory.create(fsm);
                stateRepositoryStub.init.withArgs(source, "s1").returns(Promise.resolve(fsm.init));
                return lifecycle.entry(source)
                    .then(function (value) {
                        expect(value).eql(fsm.init);
                    })
            });

            it("接受当前事件, 保持状态不变", function () {
                fsm = {
                    transitions: [
                        { name: 'modify',   from: 'draft',  to: 'draft' }
                    ],
                    methods: {
                        onModify: handlerSpy
                    }
                };
                lifecycle = lifecycleFactory.create(fsm);

                event.name = "modify";
                stateRepositoryStub.current.withArgs(source).returns(Promise.resolve("draft"));
                return lifecycle.dealWith(event)
                    .then(function () {
                        expect(handlerSpy).calledWith(source, data).calledOnce;
                    })
            });

            it("接受当前事件, 状态发生迁移", function () {
                fsm = {
                    transitions: [
                        { name: 'submit',   from: 'draft',  to: 'reviewing' }
                    ],
                    methods: {
                        onSubmit: handlerSpy
                    }
                };
                lifecycle = lifecycleFactory.create(fsm);

                event.name = "submit";
                stateRepositoryStub.current.withArgs(source).returns(Promise.resolve("draft"));
                stateRepositoryStub.update = sinon.spy();
                return lifecycle.dealWith(event)
                    .then(function () {
                        //TODO:是否需要考虑调用次序？
                        expect(handlerSpy).calledWith(source, data).calledOnce;
                        expect(stateRepositoryStub.update).calledWith(source, "reviewing").calledOnce;
                    })
            })
        })
    });
});

