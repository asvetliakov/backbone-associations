(function () {
    var y = this, h, f, v, m, n, t, A, s, B, C;
    "undefined" === typeof window ? (h = require("underscore"), f = require("backbone"), "undefined" !== typeof exports && (exports = module.exports = f)) : (h = y._, f = y.Backbone);
    v = f.Model;
    m = f.Collection;
    n = v.prototype;
    t = m.prototype;
    B = /[\.\[\]]+/g;
    A = "change add remove reset sort destroy".split(" ");
    C = ["reset", "sort"];
    f.Associations = {VERSION:"0.5.2"};
    f.Associations.Many = f.Many = "Many";
    f.Associations.One = f.One = "One";
    f.Associations.Self = f.Self = "Self";
    s = f.AssociatedModel = f.Associations.AssociatedModel =
        v.extend({relations:void 0, _proxyCalls:void 0, get:function (a) {
            var c = n.get.call(this, a);
            return c ? c : this._getAttr.apply(this, arguments)
        }, set:function (a, c, d) {
            var b;
            h.isObject(a) || null == a ? (b = a, d = c) : (b = {}, b[a] = c);
            a = this._set(b, d);
            this._processPendingEvents();
            return a
        }, _set:function (a, c) {
            var d, b, D, g, l = this;
            if (!a)return this;
            for (d in a)if (b || (b = {}), d.match(B)) {
                var f = z(d);
                g = h.initial(f);
                f = f[f.length - 1];
                g = this.get(g);
                g instanceof s && (g = b[g.cid] || (b[g.cid] = {model:g, data:{}}), g.data[f] = a[d])
            } else g = b[this.cid] ||
                (b[this.cid] = {model:this, data:{}}), g.data[d] = a[d];
            if (b)for (D in b)g = b[D], this._setAttr.call(g.model, g.data, c) || (l = !1); else l = this._setAttr.call(this, a, c);
            return l
        }, _setAttr:function (a, c) {
            var d;
            c || (c = {});
            if (c.unset)for (d in a)a[d] = void 0;
            this.parents = this.parents || [];
            this.relations && h.each(this.relations, function (b) {
                var d = b.key, g = b.relatedModel, l = b.collectionType, p = b.map, k = this.attributes[d], q = k && k.idAttribute, e, u, r, n = !1;
                !g || g.prototype instanceof v || (g = h.isFunction(g) ? g.call(this, b, a) : g);
                g && h.isString(g) &&
                (g = g === f.Self ? this.constructor : w(g));
                l && h.isString(l) && (l = w(l));
                p && h.isString(p) && (p = w(p));
                u = b.options ? h.extend({}, b.options, c) : c;
                if (!g && !l)throw Error("specify either a relatedModel or collectionType");
                if (a[d]) {
                    e = h.result(a, d);
                    e = p ? p.call(this, e, l ? l : g) : e;
                    if (b.type === f.Many) {
                        if (l && !l.prototype instanceof m)throw Error("collectionType must inherit from Backbone.Collection");
                        e instanceof m && !k ? (b = e, n = !0) : (k ? (b = k, b._deferEvents = !0) : b = l ? new l : this._createCollection(g), b[u.reset ? "reset" : "set"](e instanceof
                            m ? e.models : e, u))
                    } else if (b.type === f.One) {
                        if (!g)throw Error("specify a relatedModel for Backbone.One type");
                        if (!(g.prototype instanceof f.AssociatedModel))throw Error("specify an AssociatedModel for Backbone.One type");
                        e instanceof s ? (b = e, n = k !== e) : k ? k && e[q] && k.get(q) === e[q] ? (k._deferEvents = !0, k._set(e, u), b = k) : b = new g(e, u) : b = new g(e, u)
                    } else throw Error("type attribute must be specified and have the values Backbone.One or Backbone.Many");
                    r = a[d] = b;
                    if (n || r && !r._proxyCallback)r._proxyCallback = function () {
                        return this._bubbleEvent.call(this,
                            d, r, arguments)
                    }, r.on("all", r._proxyCallback, this)
                }
                a.hasOwnProperty(d) && (k = a[d], e = this.attributes[d], k ? (k.parents = k.parents || [], -1 == h.indexOf(k.parents, this) && k.parents.push(this)) : e && 0 < e.parents.length && (e.parents = h.difference(e.parents, [this]), e._proxyCallback && e.off("all", e._proxyCallback, this)))
            }, this);
            return n.set.call(this, a, c)
        }, _bubbleEvent:function (a, c, d) {
            var b = d[0].split(":"), f = b[0], g = "nested-change" == d[0], l = d[1], p = d[2], k = -1, q = c._proxyCalls, e, n = -1 !== h.indexOf(A, f);
            if (!g) {
                1 < h.size(b) && (e = b[1]);
                -1 !== h.indexOf(C, f) && (p = l);
                if (c instanceof m && n && l) {
                    var r = z(e), t = h.initial(r);
                    (b = c.find(function (a) {
                        if (l === a)return!0;
                        if (!a)return!1;
                        var b = a.get(t);
                        if ((b instanceof s || b instanceof m) && l === b)return!0;
                        b = a.get(r);
                        if ((b instanceof s || b instanceof m) && l === b || b instanceof m && p && p === b)return!0
                    })) && (k = c.indexOf(b))
                }
                e = a + (-1 === k || "change" !== f && !e ? "" : "[" + k + "]") + (e ? "." + e : "");
                if (/\[\*\]/g.test(e))return this;
                b = e.replace(/\[\d+\]/g, "[*]");
                k = [];
                k.push.apply(k, d);
                k[0] = f + ":" + e;
                q = c._proxyCalls = q || {};
                if (this._isEventAvailable.call(this,
                    q, e))return this;
                q[e] = !0;
                "change" === f && (this._previousAttributes[a] = c._previousAttributes, this.changed[a] = c);
                this.trigger.apply(this, k);
                "change" === f && this.get(e) != d[2] && (a = ["nested-change", e, d[1]], d[2] && a.push(d[2]), this.trigger.apply(this, a));
                q && e && delete q[e];
                e !== b && (k[0] = f + ":" + b, this.trigger.apply(this, k));
                return this
            }
        }, _isEventAvailable:function (a, c) {
            return h.find(a, function (a, b) {
                return-1 !== c.indexOf(b, c.length - b.length)
            })
        }, _createCollection:function (a) {
            var c = a;
            h.isString(c) && (c = w(c));
            if (c && c.prototype instanceof
                s)a = new m, a.model = c; else throw Error("type must inherit from Backbone.AssociatedModel");
            return a
        }, _processPendingEvents:function () {
            this._processedEvents || (this._processedEvents = !0, this._deferEvents = !1, h.each(this._pendingEvents, function (a) {
                a.c.trigger.apply(a.c, a.a)
            }), this._pendingEvents = [], h.each(this.relations, function (a) {
                (a = this.attributes[a.key]) && a._processPendingEvents()
            }, this), delete this._processedEvents)
        }, trigger:function (a) {
            this._deferEvents ? (this._pendingEvents = this._pendingEvents || [],
                this._pendingEvents.push({c:this, a:arguments})) : n.trigger.apply(this, arguments)
        }, toJSON:function (a) {
            var c = {}, d;
            c[this.idAttribute] = this.id;
            this.visited || (this.visited = !0, c = n.toJSON.apply(this, arguments), this.relations && h.each(this.relations, function (b) {
                var f = this.attributes[b.key];
                f && (d = f.toJSON(a), c[b.key] = h.isArray(d) ? h.compact(d) : d)
            }, this), delete this.visited);
            return c
        }, clone:function () {
            return new this.constructor(this.toJSON())
        }, cleanup:function () {
            h.each(this.relations, function (a) {
                (a = this.attributes[a.key]) &&
                (a.parents = h.difference(a.parents, [this]))
            }, this);
            this.off()
        }, _getAttr:function (a) {
            var c = this;
            a = z(a);
            var d, b;
            if (!(1 > h.size(a))) {
                for (b = 0; b < a.length; b++) {
                    d = a[b];
                    if (!c)break;
                    c = c instanceof m ? isNaN(d) ? void 0 : c.at(d) : c.attributes[d]
                }
                return c
            }
        }});
    var E = /[^\.\[\]]+/g, z = function (a) {
        return"" === a ? [""] : h.isString(a) ? a.match(E) : a || []
    }, w = function (a) {
        return h.reduce(a.split("."), function (a, d) {
            return a[d]
        }, y)
    }, F = function (a, c, d) {
        var b, f;
        h.find(a, function (a) {
            if (b = h.find(a.relations, function (b) {
                return a.get(b.key) ===
                    c
            }, this))return f = a, !0
        }, this);
        return b && b.map ? b.map.call(f, d, c) : d
    }, x = {};
    h.each(["set", "remove", "reset"], function (a) {
        x[a] = m.prototype[a];
        t[a] = function (c, d) {
            this.model.prototype instanceof s && this.parents && (arguments[0] = F(this.parents, this, c));
            return x[a].apply(this, arguments)
        }
    });
    x.trigger = t.trigger;
    t.trigger = function (a) {
        this._deferEvents ? (this._pendingEvents = this._pendingEvents || [], this._pendingEvents.push({c:this, a:arguments})) : x.trigger.apply(this, arguments)
    };
    t._processPendingEvents = s.prototype._processPendingEvents
}).call(this);
