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
                it('最新产品列表', function (done) {
                    var result = {
                        data: [
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
                    var searchStub = createPromiseStub([{count: 10}], [result]);
                    stubs['../data/Products'] = {search: searchStub};

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
                    var fooRes = {fee: 'feeRes'};
                    var parseResourceDescriptorStub = sinon.stub();
                    parseResourceDescriptorStub.withArgs(fooDesc).returns(fooRes);
                    stubs['./ResourceDescriptor'] = {parse: parseResourceDescriptorStub};

                    loader = proxyquire('../netup/rests/DirectoryResourceDescriptorsLoader', stubs);
                    var rests = loader.loadFrom(path.join(__dirname, './data/rests'));
                    expect(rests[0]).eql(fooRes);
                });
            });

            describe('对资源描述的解析', function () {
                var request, router, handler, url;
                var desc, resource;
                var resourceDescriptor;
                var dataToRepresent;

                beforeEach(function () {
                    dataToRepresent = {data: 'any data'};
                    router = require('express')();
                    request = require('supertest')(router);
                    url = '/rests/foo';
                    handler = function (req, res) {
                        return dataToRepresent;
                    };

                    desc = {
                        url: url,
                        rest: [
                            {
                                method: 'get',
                                handler: handler
                            }
                        ]
                    }

                    resourceDescriptor = require('../netup/rests/ResourceDescriptor');
                });

                it('一个资源应具有寻址性，必须定义url', function () {
                    delete desc.url;
                    expect(function () {
                        resourceDescriptor.parse(desc);
                    }).throw('a url must be defined!');
                });

                it('资源定义错：未定义任何rest服务', function () {
                    delete desc.rest;
                    expect(function () {
                        resourceDescriptor.parse(desc);
                    }).throw('no restful service is defined!');
                });

                it('资源定义错：未定义任何rest服务', function () {
                    desc.rest = [];
                    expect(function () {
                        resourceDescriptor.parse(desc);
                    }).throw('no restful service is defined!');
                });

                it('资源定义错：未定义处理方法', function () {
                    delete desc.rest[0].handler;
                    resource = resourceDescriptor.parse(desc);
                    expect(function () {
                        resource.attachTo(router);
                    }).throw('a handler must be defined!');
                });

                it('GET方法未返回任何数据，返回500 Internal Server Error错', function (done) {
                    desc.rest[0].handler = function () {
                    };
                    resource = resourceDescriptor.parse(desc);
                    resource.attachTo(router);
                    request.get(url)
                        .expect(500, done);
                });

                it('解析一个最基本的资源定义', function (done) {
                    resource = resourceDescriptor.parse(desc);
                    resource.attachTo(router);
                    request.get(url)
                        .expect(200, dataToRepresent, done);
                });

                it('通过在资源服务中定义representation converter，' +
                    '将数据转化为资源服务响应的', function (done) {
                    var responseRepresentation = {data: 'any representation'};
                    var representationConvertStub = sinon.stub();
                    representationConvertStub.withArgs(dataToRepresent).returns(responseRepresentation);

                    desc.rest[0].response = {
                        representation: {convert: representationConvertStub}
                    };
                    resource = resourceDescriptor.parse(desc);
                    resource.attachTo(router);

                    request.get(url)
                        .expect(200, responseRepresentation, done);
                });
            });

            describe('Rest服务注册器', function () {
                var registry;

                beforeEach(function () {
                    registry = require('../netup/rests/ResourcesRestry');
                });

                it('确保Rests服务管理器是单例', function () {
                    registry.create('foo/dir');
                    var instance1 = registry.instance;
                    var instance2 = registry.instance;
                    expect(instance1).eql(instance2);
                });

                it('可以通过目录加载Rest服务', function () {
                    var attachToSpy = sinon.spy();
                    var resource1 = {attachTo: attachToSpy};
                    var resource2 = {attachTo: attachToSpy};

                    var dir = '/dir';
                    var dirResourceDescLoaderStub = sinon.stub();
                    dirResourceDescLoaderStub.withArgs(dir).returns([resource1, resource2]);
                    stubs['./DirectoryResourceDescriptorsLoader'] = {loadFrom: dirResourceDescLoaderStub};

                    var router = new Object();
                    registry = proxyquire('../netup/rests/ResourcesRestry', stubs).create(dir);
                    registry.attachTo(router);

                    expect(attachToSpy).calledWith(router).calledTwice;
                })
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

