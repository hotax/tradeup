/**
 * Created by clx on 2017/10/9.
 */
var proxyquire = require('proxyquire'),
    path = require('path'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

describe('tradup', function () {
    var stubs, err;

    beforeEach(function () {
        stubs = {}
        err = new Error('any error message');
    });

    describe('application', function () {
        describe('数据库', function () {
            var dbConnection;
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
                it('新增', function () {
                    var specifications = require('../server/data/Specifications');
                    var data = {
                        code: 'foo',    //编码
                        name: 'foo specification',    //名称
                        grey: {     //胚布
                            yarn: { //纱支
                                warp: {val: [20, 30, 40], unit: 'S'},    //径向
                                weft: {val: [35]}     //weixiang
                            },
                            dnsty: {
                                warp: {val: [100]},
                                weft: {}
                            },
                            width: 28.63,
                            GSM: 45.68
                        },
                        product: {
                            yarn: {
                                dnstyWarp: {val: [20, 30, 40], unit: 'S'},
                                dnstyWeft: {val: [20, 30, 40], unit: 'S'}
                            },
                            dnsty: {
                                BW: {
                                    warp: {val: [20, 30, 40], unit: 'S'},
                                    weft: {val: [20, 30, 40], unit: 'S'}
                                },
                                AW: {
                                    warp: {val: [20, 30, 40], unit: 'S'},
                                    weft: {val: [20, 30, 40], unit: 'S'}
                                },
                            },
                            width: 20,
                            GSM: 50
                        },
                        desc: 'desc of foo',   //描述
                        constructure: 'constructure of foo',    //组织
                        state: 0,
                        //author: ObjectId,
                        //createdDate: {type: Date, default: Date.now, required: true},
                        //modifiedDate: Date
                    };
                    return specifications.add(data)
                        .then(function (obj) {
                            expect(obj).not.null;
                        });
                });
            })
        });

        describe('rests', function () {
            var request, app, restDescriptor;
            var requestAgent;
            var rest;

            beforeEach(function () {
                restDescriptor = require('../netup/rests/ResourceRegistry');
                requestAgent = require('supertest');
                app = require('express')();
                app.use(require('body-parser').json());
                request = requestAgent(app);
            });

            describe('可搜索的产品列表', function () {
                xit('最新产品列表', function (done) {
                    var dbData = {
                        items: [
                            {
                                _id: 'foo',
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
                            },
                            {
                                _id: 'fee',
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
                    var searchStub = createPromiseStub([{count: 10}], [dbData]);
                    stubs['../data/Products'] = {search: searchStub};

                    var result = {collection: 'any collection representation contents'};
                    var convertStub = sinon.stub();
                    convertStub.withArgs(dbData).returns(result);

                    var parseStub = sinon.stub()
                    stubs['../../netup/rests/CollectionJsonRepresentationBuilder'] = {
                        parse: function () {
                            return {convert: convertStub}
                        },
                    };

                    var desc = proxyquire('../server/rests/Products', stubs);


                    var rest = restDescriptor.parse(proxyquire('../server/rests/Products', stubs));
                    rest.attachTo(app);
                    request.get('/rests/products/all/search?count=10')
                        .expect(200, {
                            collection: {
                                version: '1.0',
                                href: '/rests/products/all/search?count=10',
                                links: [],
                                items: [
                                    {
                                        href: '/rests/products/foo',
                                        data: [
                                            {
                                                name: 'code',
                                                value: '210001'
                                            },
                                            {
                                                name: 'grey',
                                                value: {
                                                    yarn: { //纱支
                                                        warp: {val: [100]},    //径向
                                                        weft: {val: [200, 300], unit: 'ss'}     //weixiang
                                                    },
                                                    dnsty: {
                                                        warp: {val: [50]},
                                                        weft: {val: [60, 80, 100]}
                                                    }
                                                }
                                            },
                                            {
                                                name: 'desc',
                                                value: 'the description of foo'
                                            }
                                        ],
                                        links: []
                                    },
                                    {
                                        href: '/rests/products/fee',
                                        data: [
                                            {
                                                name: 'code',
                                                value: '210020'
                                            },
                                            {
                                                name: 'grey',
                                                value: {
                                                    yarn: { //纱支
                                                        warp: {val: [90]},    //径向
                                                        weft: {val: [210, 310], unit: 'pp'}     //weixiang
                                                    },
                                                    dnsty: {
                                                        warp: {val: [58]},
                                                        weft: {val: [65, 85, 110]}
                                                    }
                                                }
                                            },
                                            {
                                                name: 'desc',
                                                value: 'the description of fee'
                                            }
                                        ],
                                        links: []
                                    }
                                ],
                                queries: [],
                                template: {},
                                error: {}
                            }
                        }, done);
                })
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
                var restDescriptor;
                var dataToRepresent;

                beforeEach(function () {
                    url = '/rests/foo';
                    dataToRepresent = {data: 'any data'};
                    var bodyParser = require('body-parser');
                    requestAgent = require('supertest');
                    app = require('express')();
                    request = requestAgent(app);
                    app.use(bodyParser.json());

                    currentResource = {foo: 'current resource'};
                    desc = {
                        method: 'gEt',
                        handler: function (req, res) {
                            return dataToRepresent;
                        },
                    };

                    restDescriptor = require('../netup/rests/RestDescriptor');
                });

                it('服务定义错：未定义处理方法', function () {
                    delete desc.handler;
                    expect(function () {
                        restDescriptor.attach(app, currentResource, url, desc);
                    }).throw('a handler must be defined!');
                });

                it('GET方法未返回任何数据，返回500 Internal Server Error错', function (done) {
                    desc.handler = function () {
                    };
                    restDescriptor.attach(app, currentResource, url, desc);
                    request.get(url)
                        .expect(500, done);
                });

                it('解析一个最基本的资源服务定义', function (done) {
                    restDescriptor.attach(app, currentResource, url, desc);
                    request.get(url)
                        .expect(200, dataToRepresent, done);
                });

                it('资源服务处理返回一个Promise', function (done) {
                    desc.handler = function (req, res) {
                        var dbOperation = createPromiseStub([], [dataToRepresent]);
                        return dbOperation();
                    };
                    restDescriptor.attach(app, currentResource, url, desc);
                    request.get(url)
                        .expect(200, dataToRepresent, done);
                });

                describe('表述资源状态', function () {
                    var getTransitionUrlStub, refUrl, getLinksStub, links;

                    describe('集合资源', function () {
                        beforeEach(function () {
                            refUrl = '/ref/url/foo';
                            getTransitionUrlStub = sinon.stub();
                            links = [{rel: 'link1'}, {rel: 'link2'}];
                            getLinksStub = sinon.stub();

                            dataToRepresent = {
                                state: 'ok',
                                data: {
                                    items: []
                                }
                            };
                            desc.handler = function (req, res) {
                                return dataToRepresent;
                            };
                            desc.response = {
                                ok: {
                                    type: '@collection',
                                    "@collection": {
                                        type: 'fee'
                                    }
                                }
                            }

                            restDescriptor = require('../netup/rests/RestDescriptor');
                        });

                        it('最小的集合表述', function (done) {
                            getLinksStub.returns([]);
                            currentResource.getLinks = getLinksStub;

                            restDescriptor.attach(app, currentResource, url, desc);
                            request.get(url)
                                .expect('Content-Type', 'application/vnd.collection+json; charset=utf-8')
                                .expect(200, {
                                    collection: {
                                        version: "1.0",
                                        href: url
                                    }
                                }, done);
                        });

                        it('当前集合资源的links', function (done) {
                            var link1 = {rel: 'link1', href: 'url1'};
                            var link2 = {rel: 'link2', href: 'url2'};
                            var expectedLinks = [link1, link2];
                            getLinksStub.callsFake(function (req, context) {
                                expect(context).eql(dataToRepresent.data);
                                expect(req.originalUrl).eql(url);
                                return expectedLinks;
                            });
                            currentResource.getLinks = getLinksStub;
                            restDescriptor.attach(app, currentResource, url, desc);

                            request.get(url)
                                .expect('Content-Type', 'application/vnd.collection+json; charset=utf-8')
                                .expect(200, {
                                    collection: {
                                        version: "1.0",
                                        href: url,
                                        links: expectedLinks
                                    }
                                }, done);
                        });

                        it('表述集合元素', function (done) {
                            var element1 = {id: '001', field: 'field value 1'};
                            var element2 = {id: '002', field: 'field value 2'};
                            dataToRepresent.data = {items: [element1, element2]};

                            var link1 = {rel: 'link1', href: 'url1'};
                            var link2 = {rel: 'link2', href: 'url2'};
                            var expectedLinks = [link1, link2];
                            getLinksStub.callsFake(function (req, context) {
                                expect(context).eql(dataToRepresent.data);
                                expect(req.originalUrl).eql(url);
                                return expectedLinks;
                            });
                            currentResource.getLinks = getLinksStub;

                            var refElement1 = '/ref/element/001';
                            var refElement2 = '/ref/element/002';
                            getTransitionUrlStub.callsFake(function (targetResourceId, context, req) {
                                expect(targetResourceId).eql('fee');
                                expect(req.originalUrl).eql(url);
                                var refurl;
                                if (context === element1) refurl = refElement1;
                                if (context === element2) refurl = refElement2;
                                return refurl;
                            });
                            currentResource.getTransitionUrl = getTransitionUrlStub;

                            restDescriptor.attach(app, currentResource, url, desc);

                            request.get(url)
                                .expect('Content-Type', 'application/vnd.collection+json; charset=utf-8')
                                .expect(200, {
                                    collection: {
                                        version: "1.0",
                                        href: url,
                                        items: [
                                            {
                                                href: refElement1,
                                                data: [
                                                    {name: 'field', value: 'field value 1'}
                                                ]
                                            },
                                            {
                                                href: refElement2,
                                                data: [
                                                    {name: 'field', value: 'field value 2'}
                                                ]
                                            }
                                        ],
                                        links: expectedLinks
                                    }
                                }, done);
                        });

                    })
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

                describe('构建当前资源的URL', function () {
                    var fromResourceId, context, req;
                    var resource;

                    beforeEach(function () {
                        fromResourceId = 'fff';
                        context = {};
                        req = {
                            params: {},
                            query: {}
                        }
                    });

                    it('无路径变量', function () {
                        resource = resourceRegistry.attach(router, resourceId, desc);
                        expect(resource.getUrl()).eql(url);
                    });

                    it('未定义迁移，缺省方式从上下文中取同路径变量名相同的属性值', function () {
                        desc.url = '/url/:arg1/and/:arg2/and/:arg3';
                        context.arg3 = '1234';
                        req.params.arg2 = '3456';
                        req.query.arg1 = '5678';

                        resource = resourceRegistry.attach(router, resourceId, desc);
                        expect(resource.getUrl(fromResourceId, context, req)).eql('/url/5678/and/3456/and/1234');
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

                        resource = resourceRegistry.attach(router, resourceId, desc);
                        expect(resource.getUrl(fromResourceId, context, req)).eql('/url/5678/and/3456/and/1234/and/9876');
                    });
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
                    var fooResource = resourceRegistry.attach(router, 'foo', fooDesc);
                    resourceRegistry.attach(router, 'fee', feeDesc);
                    expect(fooResource.getTransitionUrl('fee')).eql('/url/fee');
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
                        setTransitionFinder: setTransitionsFinderSpy,
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

