// -----------------------------------------------------------------------------------
// Copyright (c) Microsoft Open Technologies (Shanghai) Co. Ltd.  All rights reserved.
//  
// The MIT License (MIT)
//  
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//  
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//  
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// -----------------------------------------------------------------------------------

;
(function($, oh) {
    $(function() {


        function editBindHackathons(name, value) {
            oh.api.admin.hackathons.get(function(hackahons) {
                var source = {};
                $.each(hackahons, function(i, o) {
                    source[o.id] = o.name;
                })
                $('[data-name="' + name + '"]').attr({
                    'data-source': JSON.stringify(source),
                    'data-value': value
                }).text(source[value]).editable();
            });
        }

        var id = parseInt($.getUrlParam('id') || 0);
        id = isNaN(id) ? 0 : id;

        if (id > 0) {
            oh.api.admin.register.get({
                query: {
                    id: id
                }
            }, function(data) {
                for (var key in data) {
                    if (key == 'hackathon_id') {
                        editBindHackathons(key, data[key]);
                    } else {
                        $('[data-name="' + key + '"]').text(data[key]).attr({
                            'data-value': data[key]
                        }).editable();
                    }
                }
            });
        } else {
            oh.api.admin.hackathons.get(function(hackahons) {
                var source = {};
                $.each(hackahons, function(i, o) {
                    source[o.id] = o.name;
                })
                $('[data-name="hackathon_id"]').editable({
                    source: source
                });
                $('.editable').editable()
            })
        }
        var savebtn = $('#save-btn').click(function() {
            savebtn.attr({
                disabled: 'disabled'
            });
            var data,
                $elems = $('.editable'),
                errors = $elems.editable('validate');
            if ($.isEmptyObject(errors)) {
                data = $elems.editable('getValue');
                data.id = id;
                data.strom_api = '';
                data.jstrom_mgmt_portal = '';
                if (id > 0) {
                    oh.api.admin.register.post({
                        body: data,
                        header: {
                            hackathon_id: data.hackathon_id
                        }
                    }, function(data) {
                        id = data.id
                        savebtn.removeAttr('disabled');
                        alert('成功');
                    });
                } else {
                    oh.api.admin.register.put({
                        body: data,
                        header: {
                            hackathon_id: data.hackathon_id
                        }
                    }, function(data) {
                        id = data.id;
                        savebtn.removeAttr('disabled');
                        location.href = location.pathname + '?id=' + id;
                        alert('成功');
                    });
                }
            } else {
                savebtn.removeAttr('disabled');
            }
        });
    });
})(jQuery, window.oh);