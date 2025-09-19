/*  * To change this template, choose Tools | Templates  * and open the template in the editor.  */
var G5 = {
    msg: {'ajax-reload': 'This page is busy loading a request from the server, please wait a moment...\n\nIf it remains unresponsive you can reload the page by clicking \'OK\', otherwise click \'Cancel\''},
    getWaitBlock: function () {
        var $waitBlock = $('#wait-block');
        if ($waitBlock.size() == 0) {
            $waitBlock = $('<a>').attr({id: 'wait-block'}).css('opacity', .50).click(function () {
                if (confirm(G5.msg['ajax-reload'])) {
                    location.reload();
                }
            }).appendTo('BODY');
        }
        return $waitBlock;
    },
    wait: function () {
        G5.getWaitBlock().show();
    },
    ready: function () {
        G5.getWaitBlock().hide();
    }
};

function setEvents($currentInput) {
    var focusAndSelect = function (input) {
        var $input = jQuery(input);
        $input.focus();
        if ($input.val().length) {
            // we have a value already so highlight it
            $input.select();
        }
    };
    var doTab = function (event) {
        var $this = jQuery(this);
        var ascii = (event.charCode || event.keyCode);
        if ($this.data('nextField') && $this.val().length + 1 == $this.attr('maxLength') && ascii > 31 && ascii < 127) {
            $this.val($this.val() + String.fromCharCode(ascii));
            focusAndSelect($this.data('nextField'));
            event.stopPropagation();
            event.preventDefault();
        } else if ($this.data('prevField') && $this.val().length == 0 && ascii == 8) {
            // focus to last field and delete
            var $prevField = jQuery($this.data('prevField'));
            if ($prevField.val().length) {
                $prevField.val($prevField.val().substring(0, $prevField.val().length - 1));
            }
            $prevField.focus();
            event.stopPropagation();
            event.preventDefault();
        }
    };
    var keydownevent = function (event) {
        var $this = jQuery(this);
        if ($this.data('nextField') && $this.val().length == $this.attr('maxLength')) {
            focusAndSelect($this.data('nextField'));
        }
    };
    if ((/Android|Blackberry/).test(navigator.userAgent)) {
        $currentInput.keydown(keydownevent);
    } else if ((/iPhone|iPod|iPad/).test(navigator.userAgent)) {
        //don't do anything. Apple won't let you programmatically focus.
    } else {
        $currentInput.keypress(doTab);
    }
}

jQuery.extend({
    AutoTabber: function (/* #id1[, #id2][, #idN...] */) {
        var $currentInput = jQuery(arguments[0]);
        $currentInput.data('nextField', arguments[1]);
        setEvents($currentInput);
        for (var i = 1, len = arguments.length; i <= len; i++) {
            $currentInput = jQuery(arguments[i]);
            $currentInput.data('prevField', arguments[i - 1]);
            $currentInput.data('nextField', arguments[i + 1]);
            setEvents($currentInput);
        }
    }
});
jQuery.fn.extend({
    /**
     * Takes matching input elements and forces a maxlength (for textareas)
     *
     * @param int maxLen
     * @param optional jquery element of field to output remaining characters allowed.  Also accepts a string selector of field.
     * @return jquery chain
     * */
    RestrictLength: function (maxLen, lenOutputElem) {
        return this.each(function () {
            var f = function () {
                if ($(this).val().length > maxLen) {
                    $(this).val($(this).val().substring(0, maxLen));
                } else if (lenOutputElem) {
                    lenOutputElem = (!(lenOutputElem instanceof jQuery) ? $(lenOutputElem) : lenOutputElem);
                    lenOutputElem.val(maxLen - $(this).val().length);
                }
            }
            //$(this).keypress(f);
            // buggy on copy 'n paste
            $(this).keyup(f);
            $(this).keydown(f);
        });
    }
});
jQuery(function ($) {
    $('.disableOnSubmit').parents('form').on('submit', function (e) {
        var $thisForm = $(e.delegateTarget);
        var $button = $thisForm.find('input.disableOnSubmit');
        $button.prop('disabled', true);
        $button.addClass('btn-disabled');
        var name = $button.prop('name');
        var value = $button.val();
        var $hidden = $('<input type="hidden">');
        $hidden.attr('name', name);
        $hidden.val(value);
        $thisForm.append($hidden);
        var $span = $thisForm.find('span.btn-wrapper.disableOnSubmit');
        if ($span.size()) {
            $span.addClass('btn-disabled');
        }
    });
});


/**
 * jquery.zend.jsonrpc.js 1.0
 * Copyright (c) 2009 Tanabicom, LLC
 * http://www.tanabi.com
 *
 * Released under the MIT license:
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the  * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * USAGE
 * var json_client = jQuery.Zend.jsonrpc(options)
 * Returns a json_client object that implements all the methods provided
 * by the Zend JSON RPC server.  Options is an object which may contain the
 * following parameters:
 * url                  - The URL of the JSON-RPC server.
 * version              - Version of JSON-RPC to implement (default: detect)
 * async                - Use async requests (boolean, default false)
 */
if (!jQuery.Zend) {
    jQuery.Zend = {};
}
jQuery.Zend.jsonrpc = function (options) {     /* Create an object that can be used to make JSON RPC calls. */
    return new (function (options) {         /* Self reference variable to be used all over the place */
        var self = this;
        /* Merge selected options in with default options. */
        this.options = jQuery.extend({url: '', version: '', async: true}, options);
        /* Keep track of our ID sequence */
        this.sequence = 1;
        /* See if we're in an error condition. */
        this.error = false;
        /* Do an ajax request to the server and build our object. */
        jQuery.ajax({
            async: self.options.async,
            contentType: 'application/json',
            type: 'get',
            processData: false,
            dataType: 'json',
            url: self.options.url,
            cache: false,
            fail: function (req, stat, err) {
                /*
                 * This is a somewhat lame error handling -- maybe we should
                 * come up with something better?
                 */
                self.error = true;
                self.error_message = stat;
                self.error_request = req;
            },
            done: function (data, stat, req) {
                if (data) {
                    /* Set version if we don't have it yet. */
                    if (!self.options.version) {
                        if (data.envelope === "JSON-RPC-1.0") {
                            self.options.version = 1;
                        } else {
                            self.options.version = 2;
                        }
                    }
                    /* On success, let's build some callback methods. */
                    jQuery.each(data.methods, function (key, val) {
                        self[key] = function () {
                            var params = new Array();
                            for (var i = 0; i < arguments.length; i++) {
                                params.push(arguments[i]);
                            }
                            var id = (self.sequence++);
                            var reply = [];
                            /* We're going to build the request array based upon
                            * version.
                            */
                            var tosend;
                            if (self.options.version === 1) {
                                tosend = {method: key, params: params, id: id};
                            } else {
                                tosend = {jsonrpc: '2.0', method: key, params: params, id: id};
                            }
                            /* AJAX away! */
                            jQuery.ajax({
                                async: self.options.async,
                                contentType: 'application/json',
                                type: data.transport,
                                processData: false,
                                dataType: 'json',
                                url: self.options.url,
                                cache: false,
                                data: JSON.stringify(tosend),
                                fail: function (req, stat, err) {
                                    self.error = true;
                                    self.error_message = stat;
                                    self.error_request = req;
                                },
                                done: function (inp) {
                                    reply = inp.result;
                                }
                            });
                            return reply;
                        }
                    });
                } else {
                    // No data returned. JQuery 1.4 fires success if code 200
                    self.error = true;
                    self.error_message = stat;
                    self.error_request = req;
                }
            }
        });
        return this;
    })(options);
};
