import{R as e,r as t}from"./react-vendor-BihJ1g-O.js";import{P as r}from"./charts-Drp7lbNo.js";function n(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?n(Object(r),!0).forEach(function(t){i(e,t,r[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):n(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}function a(e){return(a="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function s(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var r=e&&("undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"]);if(null==r)return;var n,o,a=[],i=!0,s=!1;try{for(r=r.call(e);!(i=(n=r.next()).done)&&(a.push(n.value),!t||a.length!==t);i=!0);}catch(c){s=!0,o=c}finally{try{i||null==r.return||r.return()}finally{if(s)throw o}}return a}(e,t)||function(e,t){if(!e)return;if("string"==typeof e)return c(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(e);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return c(e,t)}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function c(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}var l=function(e){return null!==e&&"object"===a(e)},u="[object Object]",d=function e(t,r){if(!l(t)||!l(r))return t===r;var n=Array.isArray(t);if(n!==Array.isArray(r))return!1;var o=Object.prototype.toString.call(t)===u;if(o!==(Object.prototype.toString.call(r)===u))return!1;if(!o&&!n)return t===r;var a=Object.keys(t),i=Object.keys(r);if(a.length!==i.length)return!1;for(var s={},c=0;c<a.length;c+=1)s[a[c]]=!0;for(var d=0;d<i.length;d+=1)s[i[d]]=!0;var f=Object.keys(s);if(f.length!==a.length)return!1;var p=t,m=r;return f.every(function(t){return e(p[t],m[t])})},f=function(e,t,r){return l(e)?Object.keys(e).reduce(function(n,a){var s=!l(t)||!d(e[a],t[a]);return r.includes(a)?n:s?o(o({},n||{}),{},i({},a,e[a])):n},null):null},p=e.createContext(null);p.displayName="ElementsContext";var m=e.createContext(null);m.displayName="CartElementContext";r.any,r.object;var y=function(t){return function(e,t){if(!e)throw new Error("Could not find Elements context; You need to wrap the part of your app that ".concat(t," in an <Elements> provider."));return e}(e.useContext(p),t)},h=function(t){return function(e,t){if(!e)throw new Error("Could not find Elements context; You need to wrap the part of your app that ".concat(t," in an <Elements> provider."));return e}(e.useContext(m),t)};r.func.isRequired;var g=function(t,r,n){var o=!!n,a=e.useRef(n);e.useEffect(function(){a.current=n},[n]),e.useEffect(function(){if(!o||!t)return function(){};var e=function(){a.current&&a.current.apply(a,arguments)};return t.on(r,e),function(){t.off(r,e)}},[o,r,t,a])},b=function(t,n){var o,a="".concat((o=t).charAt(0).toUpperCase()+o.slice(1),"Element"),i=n?function(t){y("mounts <".concat(a,">")),h("mounts <".concat(a,">"));var r=t.id,n=t.className;return e.createElement("div",{id:r,className:n})}:function(r){var n,o=r.id,i=r.className,c=r.options,l=void 0===c?{}:c,u=r.onBlur,d=r.onFocus,p=r.onReady,m=r.onChange,b=r.onEscape,v=r.onClick,E=r.onLoadError,w=r.onLoaderStart,x=r.onNetworksChange,O=r.onCheckout,S=r.onLineItemClick,C=r.onConfirm,j=r.onCancel,A=r.onShippingAddressChange,_=r.onShippingRateChange,I=y("mounts <".concat(a,">")).elements,P=s(e.useState(null),2),k=P[0],D=P[1],N=e.useRef(null),R=e.useRef(null),T=h("mounts <".concat(a,">")),F=T.setCart,M=T.setCartState;g(k,"blur",u),g(k,"focus",d),g(k,"escape",b),g(k,"click",v),g(k,"loaderror",E),g(k,"loaderstart",w),g(k,"networkschange",x),g(k,"lineitemclick",S),g(k,"confirm",C),g(k,"cancel",j),g(k,"shippingaddresschange",A),g(k,"shippingratechange",_),"cart"===t?n=function(e){M(e),p&&p(e)}:p&&(n="payButton"===t?p:function(){p(k)}),g(k,"ready",n),g(k,"change","cart"===t?function(e){M(e),m&&m(e)}:m),g(k,"checkout","cart"===t?function(e){M(e),O&&O(e)}:O),e.useLayoutEffect(function(){if(null===N.current&&I&&null!==R.current){var e=I.create(t,l);"cart"===t&&F&&F(e),N.current=e,D(e),e.mount(R.current)}},[I,l,F]);var L,$,U=(L=l,$=e.useRef(L),e.useEffect(function(){$.current=L},[L]),$.current);return e.useEffect(function(){if(N.current){var e=f(l,U,["paymentRequest"]);e&&N.current.update(e)}},[l,U]),e.useLayoutEffect(function(){return function(){N.current&&(N.current.destroy(),N.current=null)}},[]),e.createElement("div",{id:o,className:i,ref:R})};return i.propTypes={id:r.string,className:r.string,onChange:r.func,onBlur:r.func,onFocus:r.func,onReady:r.func,onEscape:r.func,onClick:r.func,onLoadError:r.func,onLoaderStart:r.func,onNetworksChange:r.func,onCheckout:r.func,onLineItemClick:r.func,onConfirm:r.func,onCancel:r.func,onShippingAddressChange:r.func,onShippingRateChange:r.func,options:r.object},i.displayName=a,i.__elementType=t,i},v="undefined"==typeof window;b("auBankAccount",v);var E,w,x=b("card",v);function O(){if(w)return E;w=1;var e,t=Object.defineProperty,r=Object.getOwnPropertyDescriptor,n=Object.getOwnPropertyNames,o=Object.prototype.hasOwnProperty,a=(e,t,r)=>new Promise((n,o)=>{var a=e=>{try{s(r.next(e))}catch(t){o(t)}},i=e=>{try{s(r.throw(e))}catch(t){o(t)}},s=e=>e.done?n(e.value):Promise.resolve(e.value).then(a,i);s((r=r.apply(e,t)).next())}),i={};((e,r)=>{for(var n in r)t(e,n,{get:r[n],enumerable:!0})})(i,{SubmissionError:()=>m,appendExtraData:()=>O,createClient:()=>A,getDefaultClient:()=>_,isSubmissionError:()=>p}),e=i,E=((e,a,i,s)=>{if(a&&"object"==typeof a||"function"==typeof a)for(let c of n(a))!o.call(e,c)&&c!==i&&t(e,c,{get:()=>a[c],enumerable:!(s=r(a,c))||s.enumerable});return e})(t({},"__esModule",{value:!0}),e);var s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",c=/^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;var l=()=>navigator.webdriver||!!document.documentElement.getAttribute(function(e){if(e=String(e).replace(/[\t\n\f\r ]+/g,""),!c.test(e))throw new TypeError("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");e+="==".slice(2-(3&e.length));for(var t,r,n,o="",a=0;a<e.length;)t=s.indexOf(e.charAt(a++))<<18|s.indexOf(e.charAt(a++))<<12|(r=s.indexOf(e.charAt(a++)))<<6|(n=s.indexOf(e.charAt(a++))),o+=64===r?String.fromCharCode(t>>16&255):64===n?String.fromCharCode(t>>16&255,t>>8&255):String.fromCharCode(t>>16&255,t>>8&255,255&t);return o}("d2ViZHJpdmVy"))||!!window.callPhantom||!!window._phantom,u=class{constructor(){this.loadedAt=Date.now(),this.webdriver=l()}data(){return{loadedAt:this.loadedAt,webdriver:this.webdriver}}},d=class{constructor(e){this.kind="success",this.next=e.next}};var f=class{constructor(e,t){this.paymentIntentClientSecret=e,this.resubmitKey=t,this.kind="stripePluginPending"}};function p(e){return"error"===e.kind}var m=class{constructor(...e){var t;this.kind="error",this.formErrors=[],this.fieldErrors=new Map;for(let r of e){if(!r.field){this.formErrors.push({code:r.code&&y(r.code)?r.code:"UNSPECIFIED",message:r.message});continue}let e=null!=(t=this.fieldErrors.get(r.field))?t:[];e.push({code:r.code&&g(r.code)?r.code:"UNSPECIFIED",message:r.message}),this.fieldErrors.set(r.field,e)}}getFormErrors(){return[...this.formErrors]}getFieldErrors(e){var t;return null!=(t=this.fieldErrors.get(e))?t:[]}getAllFieldErrors(){return Array.from(this.fieldErrors)}};function y(e){return e in h}var h={BLOCKED:"BLOCKED",EMPTY:"EMPTY",FILES_TOO_BIG:"FILES_TOO_BIG",FORM_NOT_FOUND:"FORM_NOT_FOUND",INACTIVE:"INACTIVE",NO_FILE_UPLOADS:"NO_FILE_UPLOADS",PROJECT_NOT_FOUND:"PROJECT_NOT_FOUND",TOO_MANY_FILES:"TOO_MANY_FILES"};function g(e){return e in b}var b={REQUIRED_FIELD_EMPTY:"REQUIRED_FIELD_EMPTY",REQUIRED_FIELD_MISSING:"REQUIRED_FIELD_MISSING",STRIPE_CLIENT_ERROR:"STRIPE_CLIENT_ERROR",STRIPE_SCA_ERROR:"STRIPE_SCA_ERROR",TYPE_EMAIL:"TYPE_EMAIL",TYPE_NUMERIC:"TYPE_NUMERIC",TYPE_TEXT:"TYPE_TEXT"};var v=e=>function(e){for(var t,r,n,o,a="",i=0,c=(e=String(e)).length%3;i<e.length;){if((r=e.charCodeAt(i++))>255||(n=e.charCodeAt(i++))>255||(o=e.charCodeAt(i++))>255)throw new TypeError("Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.");a+=s.charAt((t=r<<16|n<<8|o)>>18&63)+s.charAt(t>>12&63)+s.charAt(t>>6&63)+s.charAt(63&t)}return c?a.slice(0,c-3)+"===".substring(c):a}(JSON.stringify(e)),x=e=>{let t="@formspree/core@3.0.4";return e?`${e} ${t}`:t};function O(e,t,r){e instanceof FormData?e.append(t,r):e[t]=r}var S=class{constructor(e={}){this.project=e.project,this.stripe=e.stripe,"undefined"!=typeof window&&(this.session=new u)}submitForm(e,t){return a(this,arguments,function*(e,t,r={}){let n=r.endpoint||"https://formspree.io",o=this.project?`${n}/p/${this.project}/f/${e}`:`${n}/f/${e}`,i={Accept:"application/json","Formspree-Client":x(r.clientName)};function s(e){return a(this,null,function*(){try{let t=yield(yield fetch(o,{method:"POST",mode:"cors",body:e instanceof FormData?e:JSON.stringify(e),headers:i})).json();if(function(e){return null!==e&&"object"==typeof e}(t)){if(function(e){return"errors"in e&&Array.isArray(e.errors)&&e.errors.every(e=>"string"==typeof e.message)||"error"in e&&"string"==typeof e.error}(t))return Array.isArray(t.errors)?new m(...t.errors):new m({message:t.error});if(function(e){if("stripe"in e&&"resubmitKey"in e&&"string"==typeof e.resubmitKey){let{stripe:t}=e;return"object"==typeof t&&null!=t&&"paymentIntentClientSecret"in t&&"string"==typeof t.paymentIntentClientSecret}return!1}(t))return new f(t.stripe.paymentIntentClientSecret,t.resubmitKey);if(function(e){return"next"in e&&"string"==typeof e.next}(t))return new d({next:t.next})}return new m({message:"Unexpected response format"})}catch(t){let e=t instanceof Error?t.message:`Unknown error while posting to Formspree: ${JSON.stringify(t)}`;return new m({message:e})}})}if(this.session&&(i["Formspree-Session-Data"]=v(this.session.data())),t instanceof FormData||(i["Content-Type"]="application/json"),this.stripe&&r.createPaymentMethod){let e=yield r.createPaymentMethod();if(e.error)return new m({code:"STRIPE_CLIENT_ERROR",field:"paymentMethod",message:"Error creating payment method"});O(t,"paymentMethod",e.paymentMethod.id);let n=yield s(t);if("error"===n.kind)return n;if("stripePluginPending"===n.kind){let e=yield this.stripe.handleCardAction(n.paymentIntentClientSecret);if(e.error)return new m({code:"STRIPE_CLIENT_ERROR",field:"paymentMethod",message:"Stripe SCA error"});t instanceof FormData?t.delete("paymentMethod"):delete t.paymentMethod,O(t,"paymentIntent",e.paymentIntent.id),O(t,"resubmitKey",n.resubmitKey);let r=yield s(t);return C(r),r}return n}let c=yield s(t);return C(c),c})}};function C(e){let{kind:t}=e;if("success"!==t&&"error"!==t)throw new Error(`Unexpected submission result (kind: ${t})`)}var j,A=e=>new S(e),_=()=>(j||(j=A()),j);return E}b("cardNumber",v),b("cardExpiry",v),b("cardCvc",v),b("fpxBank",v),b("iban",v),b("idealBank",v),b("p24Bank",v),b("epsBank",v),b("payment",v),b("payButton",v),b("paymentRequestButton",v),b("linkAuthentication",v),b("address",v),b("shippingAddress",v),b("cart",v),b("paymentMethodMessaging",v),b("affirmMessage",v),b("afterpayClearpayMessage",v);var S,C,j=O(),A={};function _(){if(S)return A;function e(t){return(e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(t)}S=1,Object.defineProperty(A,"__esModule",{value:!0});var t,r="https://js.stripe.com/v3",n=/^https:\/\/js\.stripe\.com\/v3\/?(\?.*)?$/,o=null,a=function(e){return null!==o||(o=new Promise(function(t,o){if("undefined"!=typeof window&&"undefined"!=typeof document)if(window.Stripe,window.Stripe)t(window.Stripe);else try{var a=function(){for(var e=document.querySelectorAll('script[src^="'.concat(r,'"]')),t=0;t<e.length;t++){var o=e[t];if(n.test(o.src))return o}return null}();a&&e||a||(a=function(e){var t=e&&!e.advancedFraudSignals?"?advancedFraudSignals=false":"",n=document.createElement("script");n.src="".concat(r).concat(t);var o=document.head||document.body;if(!o)throw new Error("Expected document.body not to be null. Stripe.js requires a <body> element.");return o.appendChild(n),n}(e)),a.addEventListener("load",function(){window.Stripe?t(window.Stripe):o(new Error("Stripe.js not available"))}),a.addEventListener("error",function(){o(new Error("Failed to load Stripe.js"))})}catch(i){return void o(i)}else t(null)})),o},i=function(t){var r="invalid load parameters; expected object of shape\n\n    {advancedFraudSignals: boolean}\n\nbut received\n\n    ".concat(JSON.stringify(t),"\n");if(null===t||"object"!==e(t))throw new Error(r);if(1===Object.keys(t).length&&"boolean"==typeof t.advancedFraudSignals)return t;throw new Error(r)},s=!1,c=function(){for(var e=arguments.length,r=new Array(e),n=0;n<e;n++)r[n]=arguments[n];s=!0;var o=Date.now();return a(t).then(function(e){return function(e,t,r){if(null===e)return null;var n=e.apply(void 0,t);return function(e,t){e&&e._registerWrapper&&e._registerWrapper({name:"stripe-js",version:"1.54.2",startTime:t})}(n,r),n}(e,r,o)})};return c.setLoadParameters=function(e){if(s&&t){var r=i(e);if(Object.keys(r).reduce(function(r,n){var o;return r&&e[n]===(null===(o=t)||void 0===o?void 0:o[n])},!0))return}if(s)throw new Error("You cannot change load parameters after calling loadStripe");t=i(e)},A.loadStripe=c,A}C||(C=1,_());var I=t.createContext({elements:null});var P=e.createContext(null);function k(e,r={}){let n=t.useContext(P)??{client:j.getDefaultClient()},{elements:o}=t.useContext(I),{client:a=n.client,extraData:i,onError:s,onSuccess:c,origin:l}=r,{stripe:u}=a;return async function(t){let r=function(e){return"preventDefault"in e&&"function"==typeof e.preventDefault}(t)?function(e){e.preventDefault();let t=e.currentTarget;if("FORM"!=t.tagName)throw new Error("submit was triggered for a non-form element");return new FormData(t)}(t):t;if("object"==typeof i)for(let[e,o]of Object.entries(i)){let t;t="function"==typeof o?await o():o,void 0!==t&&j.appendExtraData(r,e,t)}let n=o?.getElement(x),d=u&&n?()=>u.createPaymentMethod({type:"card",card:n,billing_details:D(r)}):void 0,f=await a.submitForm(e,r,{endpoint:l,clientName:"@formspree/react@2.5.5",createPaymentMethod:d});j.isSubmissionError(f)?s?.(f):c?.(f)}}function D(e){let t={address:N(e)};for(let r of["name","email","phone"]){let n=e instanceof FormData?e.get(r):e[r];n&&"string"==typeof n&&(t[r]=n)}return t}function N(e){let t={};for(let[r,n]of[["address_line1","line1"],["address_line2","line2"],["address_city","city"],["address_country","country"],["address_state","state"],["address_postal_code","postal_code"]]){let o=e instanceof FormData?e.get(r):e[r];o&&"string"==typeof o&&(t[n]=o)}return t}function R(e,r={}){let[n,o]=t.useState(null),[a,i]=t.useState(null),[s,c]=t.useState(!1),[l,u]=t.useState(!1);if(!e)throw new Error('You must provide a form key or hashid (e.g. useForm("myForm") or useForm("123xyz")');let d=k(e,{client:r.client,extraData:r.data,onError(e){o(e),c(!1),u(!1)},onSuccess(e){o(null),i(e),c(!1),u(!0)},origin:r.endpoint});return[{errors:n,result:a,submitting:s,succeeded:l},async function(e){c(!0),await d(e)},function(){o(null),i(null),c(!1),u(!1)}]}let T,F,M,L={data:""},$=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,U=/\/\*[^]*?\*\/|  +/g,Y=/\n+/g,z=(e,t)=>{let r="",n="",o="";for(let a in e){let i=e[a];"@"==a[0]?"i"==a[1]?r=a+" "+i+";":n+="f"==a[1]?z(i,a):a+"{"+z(i,"k"==a[1]?"":t)+"}":"object"==typeof i?n+=z(i,t?t.replace(/([^,])+/g,e=>a.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):a):null!=i&&(a=/^--/.test(a)?a:a.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=z.p?z.p(a,i):a+":"+i+";")}return r+(t&&o?t+"{"+o+"}":o)+n},B={},K=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+K(e[r]);return t}return e};function J(e){let t=this||{},r=e.call?e(t.p):e;return((e,t,r,n,o)=>{let a=K(e),i=B[a]||(B[a]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(a));if(!B[i]){let t=a!==e?e:(e=>{let t,r,n=[{}];for(;t=$.exec(e.replace(U,""));)t[4]?n.shift():t[3]?(r=t[3].replace(Y," ").trim(),n.unshift(n[0][r]=n[0][r]||{})):n[0][t[1]]=t[2].replace(Y," ").trim();return n[0]})(e);B[i]=z(o?{["@keyframes "+i]:t}:t,r?"":"."+i)}let s=r&&B.g?B.g:null;return r&&(B.g=B[i]),c=B[i],l=t,u=n,(d=s)?l.data=l.data.replace(d,c):-1===l.data.indexOf(c)&&(l.data=u?c+l.data:l.data+c),i;var c,l,u,d})(r.unshift?r.raw?((e,t,r)=>e.reduce((e,n,o)=>{let a=t[o];if(a&&a.call){let e=a(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;a=t?"."+t:e&&"object"==typeof e?e.props?"":z(e,""):!1===e?"":e}return e+n+(null==a?"":a)},""))(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,(n=t.target,"object"==typeof window?((n?n.querySelector("#_goober"):window._goober)||Object.assign((n||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:n||L),t.g,t.o,t.k);var n}J.bind({g:1});let q=J.bind({k:1});function H(e,t){let r=this||{};return function(){let t=arguments;return function n(o,a){let i=Object.assign({},o),s=i.className||n.className;r.p=Object.assign({theme:F&&F()},i),r.o=/ *go\d+/.test(s),i.className=J.apply(r,t)+(s?" "+s:"");let c=e;return e[0]&&(c=i.as||e,delete i.as),M&&c[0]&&M(i),T(c,i)}}}var Z=(e,t)=>(e=>"function"==typeof e)(e)?e(t):e,G=(()=>{let e=0;return()=>(++e).toString()})(),Q=(()=>{let e;return()=>{if(void 0===e&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),V="default",W=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:n}=t;return W(e,{type:e.toasts.find(e=>e.id===n.id)?1:0,toast:n});case 3:let{toastId:o}=t;return{...e,toasts:e.toasts.map(e=>e.id===o||void 0===o?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let a=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+a}))}}},X=[],ee={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},te={},re=(e,t=V)=>{te[t]=W(te[t]||ee,e),X.forEach(([e,r])=>{e===t&&r(te[t])})},ne=e=>Object.keys(te).forEach(t=>re(e,t)),oe=(e=V)=>t=>{re(t,e)},ae={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},ie=e=>(t,r)=>{let n=((e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||G()}))(t,e,r);return oe(n.toasterId||(e=>Object.keys(te).find(t=>te[t].toasts.some(t=>t.id===e)))(n.id))({type:2,toast:n}),n.id},se=(e,t)=>ie("blank")(e,t);se.error=ie("error"),se.success=ie("success"),se.loading=ie("loading"),se.custom=ie("custom"),se.dismiss=(e,t)=>{let r={type:3,toastId:e};t?oe(t)(r):ne(r)},se.dismissAll=e=>se.dismiss(void 0,e),se.remove=(e,t)=>{let r={type:4,toastId:e};t?oe(t)(r):ne(r)},se.removeAll=e=>se.remove(void 0,e),se.promise=(e,t,r)=>{let n=se.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let o=t.success?Z(t.success,e):void 0;return o?se.success(o,{id:n,...r,...null==r?void 0:r.success}):se.dismiss(n),e}).catch(e=>{let o=t.error?Z(t.error,e):void 0;o?se.error(o,{id:n,...r,...null==r?void 0:r.error}):se.dismiss(n)}),e};var ce,le,ue,de,fe=(e,r="default")=>{let{toasts:n,pausedAt:o}=((e={},r=V)=>{let[n,o]=t.useState(te[r]||ee),a=t.useRef(te[r]);t.useEffect(()=>(a.current!==te[r]&&o(te[r]),X.push([r,o]),()=>{let e=X.findIndex(([e])=>e===r);e>-1&&X.splice(e,1)}),[r]);let i=n.toasts.map(t=>{var r,n,o;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(n=e[t.type])?void 0:n.duration)||(null==e?void 0:e.duration)||ae[t.type],style:{...e.style,...null==(o=e[t.type])?void 0:o.style,...t.style}}});return{...n,toasts:i}})(e,r),a=t.useRef(new Map).current,i=t.useCallback((e,t=1e3)=>{if(a.has(e))return;let r=setTimeout(()=>{a.delete(e),s({type:4,toastId:e})},t);a.set(e,r)},[]);t.useEffect(()=>{if(o)return;let e=Date.now(),t=n.map(t=>{if(t.duration===1/0)return;let n=(t.duration||0)+t.pauseDuration-(e-t.createdAt);if(!(n<0))return setTimeout(()=>se.dismiss(t.id,r),n);t.visible&&se.dismiss(t.id)});return()=>{t.forEach(e=>e&&clearTimeout(e))}},[n,o,r]);let s=t.useCallback(oe(r),[r]),c=t.useCallback(()=>{s({type:5,time:Date.now()})},[s]),l=t.useCallback((e,t)=>{s({type:1,toast:{id:e,height:t}})},[s]),u=t.useCallback(()=>{o&&s({type:6,time:Date.now()})},[o,s]),d=t.useCallback((e,t)=>{let{reverseOrder:r=!1,gutter:o=8,defaultPosition:a}=t||{},i=n.filter(t=>(t.position||a)===(e.position||a)&&t.height),s=i.findIndex(t=>t.id===e.id),c=i.filter((e,t)=>t<s&&e.visible).length;return i.filter(e=>e.visible).slice(...r?[c+1]:[0,c]).reduce((e,t)=>e+(t.height||0)+o,0)},[n]);return t.useEffect(()=>{n.forEach(e=>{if(e.dismissed)i(e.id,e.removeDelay);else{let t=a.get(e.id);t&&(clearTimeout(t),a.delete(e.id))}})},[n,i]),{toasts:n,handlers:{updateHeight:l,startPause:c,endPause:u,calculateOffset:d}}},pe=q`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,me=q`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,ye=q`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,he=H("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${pe} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${me} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${ye} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,ge=q`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,be=H("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${ge} 1s linear infinite;
`,ve=q`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,Ee=q`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,we=H("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ve} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${Ee} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,xe=H("div")`
  position: absolute;
`,Oe=H("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,Se=q`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Ce=H("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Se} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,je=({toast:e})=>{let{icon:r,type:n,iconTheme:o}=e;return void 0!==r?"string"==typeof r?t.createElement(Ce,null,r):r:"blank"===n?null:t.createElement(Oe,null,t.createElement(be,{...o}),"loading"!==n&&t.createElement(xe,null,"error"===n?t.createElement(he,{...o}):t.createElement(we,{...o})))},Ae=e=>`\n0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}\n100% {transform: translate3d(0,0,0) scale(1); opacity:1;}\n`,_e=e=>`\n0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}\n100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}\n`,Ie=H("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,Pe=H("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,ke=t.memo(({toast:e,position:r,style:n,children:o})=>{let a=e.height?((e,t)=>{let r=e.includes("top")?1:-1,[n,o]=Q()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[Ae(r),_e(r)];return{animation:t?`${q(n)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${q(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||r||"top-center",e.visible):{opacity:0},i=t.createElement(je,{toast:e}),s=t.createElement(Pe,{...e.ariaProps},Z(e.message,e));return t.createElement(Ie,{className:e.className,style:{...a,...n,...e.style}},"function"==typeof o?o({icon:i,message:s}):t.createElement(t.Fragment,null,i,s))});ce=t.createElement,z.p=le,T=ce,F=ue,M=de;var De=({id:e,className:r,style:n,onHeightUpdate:o,children:a})=>{let i=t.useCallback(t=>{if(t){let r=()=>{let r=t.getBoundingClientRect().height;o(e,r)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,o]);return t.createElement("div",{ref:i,className:r,style:n},a)},Ne=J`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,Re=({reverseOrder:e,position:r="top-center",toastOptions:n,gutter:o,children:a,toasterId:i,containerStyle:s,containerClassName:c})=>{let{toasts:l,handlers:u}=fe(n,i);return t.createElement("div",{"data-rht-toaster":i||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...s},className:c,onMouseEnter:u.startPause,onMouseLeave:u.endPause},l.map(n=>{let i=n.position||r,s=((e,t)=>{let r=e.includes("top"),n=r?{top:0}:{bottom:0},o=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:Q()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...n,...o}})(i,u.calculateOffset(n,{reverseOrder:e,gutter:o,defaultPosition:r}));return t.createElement(De,{id:n.id,key:n.id,onHeightUpdate:u.updateHeight,className:n.visible?Ne:"",style:s},"custom"===n.type?Z(n.message,n):a?a(n):t.createElement(ke,{toast:n,position:i}))}))},Te=se;export{Re as F,R as X,Te as z};
