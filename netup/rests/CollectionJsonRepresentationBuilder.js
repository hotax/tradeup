/**
 * Created by clx on 2017/10/21.
 */
const linkBuilder = require('./ResourcesRestry');

module.exports = {
    parse: function (desc) {
        return {
            convert: function (data) {
                var result = {
                    collection: {
                        version: '1.0',
                        href: data.url,
                        items: [],
                    }
                };
                var items = [];
                data.data.items.forEach(function (itemData) {
                    var item = {
                        data: []
                    };
                    var properties = [];
                    for (var property in itemData) {
                        if (property === '_id') {
                            item.href = linkBuilder.getUrl(desc.element.resourceId, [itemData._id]);
                        }else{
                            properties.push({
                                name: property,
                                value: itemData[property]
                            });
                        }
                    }
                    item.data = properties;
                    result.collection.items.push(item);
                });
                return result;
            }
        }
    }
}