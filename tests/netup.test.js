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
                                warp: {val: [20,30,40], unit: 'S'},    //径向
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
                                dnstyWarp: {val: [20,30,40], unit: 'S'},
                                dnstyWeft: {val: [20,30,40], unit: 'S'}
                            },
                            dnsty: {
                                BW: {
                                    warp: {val: [20,30,40], unit: 'S'},
                                    weft: {val: [20,30,40], unit: 'S'}
                                },
                                AW: {
                                    warp: {val: [20,30,40], unit: 'S'},
                                    weft: {val: [20,30,40], unit: 'S'}
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
                restDescriptor = require('../netup/rests/ResourceDescriptor');
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

            describe('Collection+JSON representation converter', function () {
                it('最基本的表述', function () {
                    var representationDesc = {
                        element: {
                            resourceId: './fooresource'
                        }
                    };
                    var getUrlStub = sinon.stub();
                    getUrlStub.withArgs(representationDesc.element.resourceId, ['foo']).returns('/foos/foo');
                    getUrlStub.withArgs(representationDesc.element.resourceId, ['fee']).returns('/foos/fee');
                    stubs['./ResourcesRestry'] = {getUrl: getUrlStub};

                    var url = '/foocollection/all';
                    var data = {
                        url: url,
                        data: {
                            items: [
                                {
                                    _id: 'foo',
                                    foo: 'foo value',
                                    fee: 'fee value'
                                },
                                {
                                    _id: 'fee',
                                    fuu: 'fuu value',
                                }
                            ]
                        }
                    };
                    var builder = proxyquire('../netup/rests/CollectionJsonRepresentationBuilder', stubs);
                    var converter = builder.parse(representationDesc);
                    expect(converter.convert(data)).eql({
                        collection: {
                            href: url,
                            version: "1.0",
                            items: [
                                {
                                    href: "/foos/foo",
                                    data: [
                                        {name: "foo", value: "foo value"},
                                        {name: "fee", value: "fee value"},
                                    ]
                                },
                                {
                                    href: "/foos/fee",
                                    data: [
                                        {name: "fuu", value: "fuu value"},
                                    ]
                                }
                            ]
                        }
                    });
                    const responseMock = require('mock-express-response');
                    var res = new responseMock();
                    converter.writeHead(res);
                    expect(res.get('Content-Type')).eql('application/vnd.collection+json');
                })
            });

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

            describe('对资源描述的解析', function () {
                var request, router, handler, url;
                var desc, restDesc, resourceId;
                var resourceDescriptor;
                var dataToRepresent;

                beforeEach(function () {
                    dataToRepresent = {data: 'any data'};
                    router = require('express')();
                    request = require('supertest')(router);
                    url = '/rests/foo';
                    resourceId = 'foo';
                    handler = function (req, res) {
                        return dataToRepresent;
                    };

                    restDesc = {rest: 'any rest descriptor'};

                    desc = {
                        url: url,
                        rests: [restDesc]
                    }

                    resourceDescriptor = require('../netup/rests/ResourceDescriptor');
                });

                it('一个资源应具有寻址性，必须定义url模板', function () {
                    delete desc.url;
                    expect(function () {
                        resourceDescriptor.attach(router, resourceId, desc);
                    }).throw('a url must be defined!');
                });

                it('通过url模板构造url', function () {
                    desc.url = '/url/:arg1/and/:arg2';

                    var attachSpy = sinon.spy();
                    stubs['./RestDescriptor'] = {attach: attachSpy};
                    resourceDescriptor = proxyquire('../netup/rests/ResourceDescriptor', stubs);

                    var resource = resourceDescriptor.attach(router, resourceId, desc);
                    expect(resource.getUrl(['foo', 'fee'])).eql('/url/foo/and/fee');
                    expect(resource.getUrl(['fuu', 'fee'])).eql('/url/fuu/and/fee');
                });

                it('资源定义错：未定义任何rest服务', function () {
                    delete desc.rests;
                    expect(function () {
                        resourceDescriptor.attach(router, resourceId, desc);
                    }).throw('no restful service is defined!');
                });

                it('资源定义错：未定义任何rest服务', function () {
                    desc.rests = [];
                    expect(function () {
                        resourceDescriptor.attach(router, resourceId, desc);
                    }).throw('no restful service is defined!');
                });

                it('加载一个资源服务', function () {
                    var attachSpy = sinon.spy();
                    stubs['./RestDescriptor'] = {attach: attachSpy};
                    resourceDescriptor = proxyquire('../netup/rests/ResourceDescriptor', stubs);

                    resourceDescriptor.attach(router, resourceId, desc);
                    expect(attachSpy).calledWith(router, resourceId, url, restDesc);
                });

            });

            describe('对Rest服务的解析', function () {
                var requestAgent, app, request;
                var url, desc, resourceId;
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

                    resourceId = 'foo';
                    desc = {
                        method: 'gEt',
                        handler: function (req, res) {
                            return dataToRepresent;
                        }
                    };

                    restDescriptor = require('../netup/rests/RestDescriptor');
                });

                it('服务定义错：未定义处理方法', function () {
                    delete desc.handler;
                    expect(function () {
                        restDescriptor.attach(app, resourceId, url, desc);
                    }).throw('a handler must be defined!');
                });

                it('GET方法未返回任何数据，返回500 Internal Server Error错', function (done) {
                    desc.handler = function () {
                    };
                    restDescriptor.attach(app, resourceId, url, desc);
                    request.get(url)
                        .expect(500, done);
                });

                it('解析一个最基本的资源服务定义', function (done) {
                    restDescriptor.attach(app, resourceId, url, desc);
                    request.get(url)
                        .expect(200, dataToRepresent, done);
                });

                it('资源服务处理返回一个Promise', function (done) {
                    desc.handler = function (req, res) {
                        var dbOperation = createPromiseStub([], [dataToRepresent]);
                        return dbOperation();
                    };
                    restDescriptor.attach(app, resourceId, url, desc);
                    request.get(url)
                        .expect(200, dataToRepresent, done);
                });

                it('通过在资源服务中定义representation converter，' +
                    '将数据转化为资源服务响应的表述', function (done) {
                    var responseRepresentation = {data: 'any representation'};
                    var representationConvertStub = sinon.stub();
                    representationConvertStub
                        .withArgs({
                            url: url,
                            data: dataToRepresent
                        })
                        .returns(responseRepresentation);
                    var writeHeadSpy = sinon.spy();

                    desc.response = {
                        representation: {
                            convert: representationConvertStub,
                            writeHead: writeHeadSpy
                        }
                    };
                    restDescriptor.attach(app, resourceId, url, desc);

                    request.get(url)
                        .expect(200, responseRepresentation)
                        .end(function (err, res) {
                            expect(writeHeadSpy).calledOnce;
                            done();
                        });
                });
            });

            describe('资源注册器', function () {
                var registry;

                beforeEach(function () {
                });

                it('可以加载所有的资源服务', function () {
                    var fooDesc = {foo: 'foo desc'};
                    var feeDesc = {fee: 'fee desc'};
                    var resourceDescriptors = {
                        foo: fooDesc,
                        fee: feeDesc
                    };

                    var router = {data: 'any app object'};

                    var attachSpy = sinon.spy();
                    stubs['./ResourceDescriptor'] = {attach: attachSpy};

                    registry = proxyquire('../netup/rests/ResourcesRestry', stubs);
                    registry.load(resourceDescriptors);
                    registry.attachTo(router);

                    expect(attachSpy).calledWith(router, 'foo', fooDesc);
                    expect(attachSpy).calledWith(router, 'fee', feeDesc);
                });

                it('资源注册器就是一个单例的资源url构造器', function () {
                    var fooResourceId = "foo";
                    var fooDesc = {foo: 'foo desc'};
                    var resourceDescriptors = {};
                    resourceDescriptors[fooResourceId] = fooDesc;

                    var urlArgs = ['foo'];
                    var getUrlSpy = sinon.spy();
                    var fooResource = {getUrl: getUrlSpy};

                    var router = {data: 'any app object'};
                    var attachStub = sinon.stub();
                    attachStub.withArgs(router, fooResourceId, fooDesc).returns(fooResource);
                    stubs['./ResourceDescriptor'] = {attach: attachStub};

                    registry = proxyquire('../netup/rests/ResourcesRestry', stubs);
                    registry.load(resourceDescriptors);
                    registry.attachTo(router);

                    var url = registry.getUrl(fooResourceId, urlArgs);
                    expect(getUrlSpy).calledWith(urlArgs).calledOnce;
                });
            });

        });
        /*describe('aaaaa', function () {
         it('开发人员可以通过设置资源注册器加载资源', function (done) {
         var restDir = path.join(__dirname, './data/rests');
         var resourceRegistry = require('../netup/rests/ResourcesRestry')(restDir);
         appBuilder.setRests(resourceRegistry).end();
         //runAndCheckServer(port, 'http://localhost:' + port + '/rests/foo', done);
         });
         });*/


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
                    var loadSpy = sinon.spy();
                    var app = appBuilder
                        .setRests({attachTo: loadSpy})
                        .end();
                    expect(loadSpy).calledWith(app).calledOnce;
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

                    /*it('开发人员可以通过设置资源注册器加载资源', function (done) {
                     var restDir = path.join(__dirname, './data/rests');
                     var resourceRegistry = require('../netup/rests/ResourcesRestry')(restDir);
                     appBuilder.setRests(resourceRegistry).end();
                     runAndCheckServer(port, 'http://localhost:' + port + '/rests/foo', done);
                     });*/
                });
            });
        });
    });
});

