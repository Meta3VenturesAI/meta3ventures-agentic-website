import{R as e,r as t}from"./router-Bf3h2-TO.js";import{g as r}from"./react-vendor-eVk5PToZ.js";var n,o,a,i,s,c={exports:{}};function l(){if(o)return n;o=1;return n="SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED"}function u(){if(i)return a;i=1;var e=l();function t(){}function r(){}return r.resetWarningCache=t,a=function(){function n(t,r,n,o,a,i){if(i!==e){var s=new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");throw s.name="Invariant Violation",s}}function o(){return n}n.isRequired=n;var a={array:n,bigint:n,bool:n,func:n,number:n,object:n,string:n,symbol:n,any:n,arrayOf:o,element:n,elementType:n,instanceOf:o,node:n,objectOf:o,oneOf:o,oneOfType:o,shape:o,exact:o,checkPropTypes:r,resetWarningCache:t};return a.PropTypes=a,a}}function d(){return s||(s=1,c.exports=u()()),c.exports}const f=r(d());function p(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,n)}return r}function m(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?p(Object(r),!0).forEach(function(t){h(e,t,r[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):p(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}function y(e){return(y="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function h(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function g(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var r=e&&("undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"]);if(null==r)return;var n,o,a=[],i=!0,s=!1;try{for(r=r.call(e);!(i=(n=r.next()).done)&&(a.push(n.value),!t||a.length!==t);i=!0);}catch(c){s=!0,o=c}finally{try{i||null==r.return||r.return()}finally{if(s)throw o}}return a}(e,t)||function(e,t){if(!e)return;if("string"==typeof e)return b(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(e);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return b(e,t)}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function b(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}var v=function(e){return null!==e&&"object"===y(e)},E="[object Object]",w=function e(t,r){if(!v(t)||!v(r))return t===r;var n=Array.isArray(t);if(n!==Array.isArray(r))return!1;var o=Object.prototype.toString.call(t)===E;if(o!==(Object.prototype.toString.call(r)===E))return!1;if(!o&&!n)return t===r;var a=Object.keys(t),i=Object.keys(r);if(a.length!==i.length)return!1;for(var s={},c=0;c<a.length;c+=1)s[a[c]]=!0;for(var l=0;l<i.length;l+=1)s[i[l]]=!0;var u=Object.keys(s);if(u.length!==a.length)return!1;var d=t,f=r;return u.every(function(t){return e(d[t],f[t])})},O=function(e,t,r){return v(e)?Object.keys(e).reduce(function(n,o){var a=!v(t)||!w(e[o],t[o]);return r.includes(o)?n:a?m(m({},n||{}),{},h({},o,e[o])):n},null):null},x=e.createContext(null);x.displayName="ElementsContext";var S=e.createContext(null);S.displayName="CartElementContext";f.any,f.object;var C=function(t){return function(e,t){if(!e)throw new Error("Could not find Elements context; You need to wrap the part of your app that ".concat(t," in an <Elements> provider."));return e}(e.useContext(x),t)},_=function(t){return function(e,t){if(!e)throw new Error("Could not find Elements context; You need to wrap the part of your app that ".concat(t," in an <Elements> provider."));return e}(e.useContext(S),t)};f.func.isRequired;var j=function(t,r,n){var o=!!n,a=e.useRef(n);e.useEffect(function(){a.current=n},[n]),e.useEffect(function(){if(!o||!t)return function(){};var e=function(){a.current&&a.current.apply(a,arguments)};return t.on(r,e),function(){t.off(r,e)}},[o,r,t,a])},I=function(t,r){var n,o="".concat((n=t).charAt(0).toUpperCase()+n.slice(1),"Element"),a=r?function(t){C("mounts <".concat(o,">")),_("mounts <".concat(o,">"));var r=t.id,n=t.className;return e.createElement("div",{id:r,className:n})}:function(r){var n,a=r.id,i=r.className,s=r.options,c=void 0===s?{}:s,l=r.onBlur,u=r.onFocus,d=r.onReady,f=r.onChange,p=r.onEscape,m=r.onClick,y=r.onLoadError,h=r.onLoaderStart,b=r.onNetworksChange,v=r.onCheckout,E=r.onLineItemClick,w=r.onConfirm,x=r.onCancel,S=r.onShippingAddressChange,I=r.onShippingRateChange,A=C("mounts <".concat(o,">")).elements,P=g(e.useState(null),2),T=P[0],k=P[1],R=e.useRef(null),D=e.useRef(null),N=_("mounts <".concat(o,">")),F=N.setCart,L=N.setCartState;j(T,"blur",l),j(T,"focus",u),j(T,"escape",p),j(T,"click",m),j(T,"loaderror",y),j(T,"loaderstart",h),j(T,"networkschange",b),j(T,"lineitemclick",E),j(T,"confirm",w),j(T,"cancel",x),j(T,"shippingaddresschange",S),j(T,"shippingratechange",I),"cart"===t?n=function(e){L(e),d&&d(e)}:d&&(n="payButton"===t?d:function(){d(T)}),j(T,"ready",n),j(T,"change","cart"===t?function(e){L(e),f&&f(e)}:f),j(T,"checkout","cart"===t?function(e){L(e),v&&v(e)}:v),e.useLayoutEffect(function(){if(null===R.current&&A&&null!==D.current){var e=A.create(t,c);"cart"===t&&F&&F(e),R.current=e,k(e),e.mount(D.current)}},[A,c,F]);var M,$,U=(M=c,$=e.useRef(M),e.useEffect(function(){$.current=M},[M]),$.current);return e.useEffect(function(){if(R.current){var e=O(c,U,["paymentRequest"]);e&&R.current.update(e)}},[c,U]),e.useLayoutEffect(function(){return function(){R.current&&(R.current.destroy(),R.current=null)}},[]),e.createElement("div",{id:a,className:i,ref:D})};return a.propTypes={id:f.string,className:f.string,onChange:f.func,onBlur:f.func,onFocus:f.func,onReady:f.func,onEscape:f.func,onClick:f.func,onLoadError:f.func,onLoaderStart:f.func,onNetworksChange:f.func,onCheckout:f.func,onLineItemClick:f.func,onConfirm:f.func,onCancel:f.func,onShippingAddressChange:f.func,onShippingRateChange:f.func,options:f.object},a.displayName=o,a.__elementType=t,a},A="undefined"==typeof window;I("auBankAccount",A);var P,T,k=I("card",A);function R(){if(T)return P;T=1;var e,t=Object.defineProperty,r=Object.getOwnPropertyDescriptor,n=Object.getOwnPropertyNames,o=Object.prototype.hasOwnProperty,a=(e,t,r)=>new Promise((n,o)=>{var a=e=>{try{s(r.next(e))}catch(t){o(t)}},i=e=>{try{s(r.throw(e))}catch(t){o(t)}},s=e=>e.done?n(e.value):Promise.resolve(e.value).then(a,i);s((r=r.apply(e,t)).next())}),i={};((e,r)=>{for(var n in r)t(e,n,{get:r[n],enumerable:!0})})(i,{SubmissionError:()=>m,appendExtraData:()=>w,createClient:()=>C,getDefaultClient:()=>_,isSubmissionError:()=>p}),e=i,P=((e,a,i,s)=>{if(a&&"object"==typeof a||"function"==typeof a)for(let c of n(a))!o.call(e,c)&&c!==i&&t(e,c,{get:()=>a[c],enumerable:!(s=r(a,c))||s.enumerable});return e})(t({},"__esModule",{value:!0}),e);var s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",c=/^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;var l=()=>navigator.webdriver||!!document.documentElement.getAttribute(function(e){if(e=String(e).replace(/[\t\n\f\r ]+/g,""),!c.test(e))throw new TypeError("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");e+="==".slice(2-(3&e.length));for(var t,r,n,o="",a=0;a<e.length;)t=s.indexOf(e.charAt(a++))<<18|s.indexOf(e.charAt(a++))<<12|(r=s.indexOf(e.charAt(a++)))<<6|(n=s.indexOf(e.charAt(a++))),o+=64===r?String.fromCharCode(t>>16&255):64===n?String.fromCharCode(t>>16&255,t>>8&255):String.fromCharCode(t>>16&255,t>>8&255,255&t);return o}("d2ViZHJpdmVy"))||!!window.callPhantom||!!window._phantom,u=class{constructor(){this.loadedAt=Date.now(),this.webdriver=l()}data(){return{loadedAt:this.loadedAt,webdriver:this.webdriver}}},d=class{constructor(e){this.kind="success",this.next=e.next}};var f=class{constructor(e,t){this.paymentIntentClientSecret=e,this.resubmitKey=t,this.kind="stripePluginPending"}};function p(e){return"error"===e.kind}var m=class{constructor(...e){var t;this.kind="error",this.formErrors=[],this.fieldErrors=new Map;for(let r of e){if(!r.field){this.formErrors.push({code:r.code&&y(r.code)?r.code:"UNSPECIFIED",message:r.message});continue}let e=null!=(t=this.fieldErrors.get(r.field))?t:[];e.push({code:r.code&&g(r.code)?r.code:"UNSPECIFIED",message:r.message}),this.fieldErrors.set(r.field,e)}}getFormErrors(){return[...this.formErrors]}getFieldErrors(e){var t;return null!=(t=this.fieldErrors.get(e))?t:[]}getAllFieldErrors(){return Array.from(this.fieldErrors)}};function y(e){return e in h}var h={BLOCKED:"BLOCKED",EMPTY:"EMPTY",FILES_TOO_BIG:"FILES_TOO_BIG",FORM_NOT_FOUND:"FORM_NOT_FOUND",INACTIVE:"INACTIVE",NO_FILE_UPLOADS:"NO_FILE_UPLOADS",PROJECT_NOT_FOUND:"PROJECT_NOT_FOUND",TOO_MANY_FILES:"TOO_MANY_FILES"};function g(e){return e in b}var b={REQUIRED_FIELD_EMPTY:"REQUIRED_FIELD_EMPTY",REQUIRED_FIELD_MISSING:"REQUIRED_FIELD_MISSING",STRIPE_CLIENT_ERROR:"STRIPE_CLIENT_ERROR",STRIPE_SCA_ERROR:"STRIPE_SCA_ERROR",TYPE_EMAIL:"TYPE_EMAIL",TYPE_NUMERIC:"TYPE_NUMERIC",TYPE_TEXT:"TYPE_TEXT"};var v=e=>function(e){for(var t,r,n,o,a="",i=0,c=(e=String(e)).length%3;i<e.length;){if((r=e.charCodeAt(i++))>255||(n=e.charCodeAt(i++))>255||(o=e.charCodeAt(i++))>255)throw new TypeError("Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.");a+=s.charAt((t=r<<16|n<<8|o)>>18&63)+s.charAt(t>>12&63)+s.charAt(t>>6&63)+s.charAt(63&t)}return c?a.slice(0,c-3)+"===".substring(c):a}(JSON.stringify(e)),E=e=>{let t="@formspree/core@3.0.4";return e?`${e} ${t}`:t};function w(e,t,r){e instanceof FormData?e.append(t,r):e[t]=r}var O=class{constructor(e={}){this.project=e.project,this.stripe=e.stripe,"undefined"!=typeof window&&(this.session=new u)}submitForm(e,t){return a(this,arguments,function*(e,t,r={}){let n=r.endpoint||"https://formspree.io",o=this.project?`${n}/p/${this.project}/f/${e}`:`${n}/f/${e}`,i={Accept:"application/json","Formspree-Client":E(r.clientName)};function s(e){return a(this,null,function*(){try{let t=yield(yield fetch(o,{method:"POST",mode:"cors",body:e instanceof FormData?e:JSON.stringify(e),headers:i})).json();if(function(e){return null!==e&&"object"==typeof e}(t)){if(function(e){return"errors"in e&&Array.isArray(e.errors)&&e.errors.every(e=>"string"==typeof e.message)||"error"in e&&"string"==typeof e.error}(t))return Array.isArray(t.errors)?new m(...t.errors):new m({message:t.error});if(function(e){if("stripe"in e&&"resubmitKey"in e&&"string"==typeof e.resubmitKey){let{stripe:t}=e;return"object"==typeof t&&null!=t&&"paymentIntentClientSecret"in t&&"string"==typeof t.paymentIntentClientSecret}return!1}(t))return new f(t.stripe.paymentIntentClientSecret,t.resubmitKey);if(function(e){return"next"in e&&"string"==typeof e.next}(t))return new d({next:t.next})}return new m({message:"Unexpected response format"})}catch(t){let e=t instanceof Error?t.message:`Unknown error while posting to Formspree: ${JSON.stringify(t)}`;return new m({message:e})}})}if(this.session&&(i["Formspree-Session-Data"]=v(this.session.data())),t instanceof FormData||(i["Content-Type"]="application/json"),this.stripe&&r.createPaymentMethod){let e=yield r.createPaymentMethod();if(e.error)return new m({code:"STRIPE_CLIENT_ERROR",field:"paymentMethod",message:"Error creating payment method"});w(t,"paymentMethod",e.paymentMethod.id);let n=yield s(t);if("error"===n.kind)return n;if("stripePluginPending"===n.kind){let e=yield this.stripe.handleCardAction(n.paymentIntentClientSecret);if(e.error)return new m({code:"STRIPE_CLIENT_ERROR",field:"paymentMethod",message:"Stripe SCA error"});t instanceof FormData?t.delete("paymentMethod"):delete t.paymentMethod,w(t,"paymentIntent",e.paymentIntent.id),w(t,"resubmitKey",n.resubmitKey);let r=yield s(t);return x(r),r}return n}let c=yield s(t);return x(c),c})}};function x(e){let{kind:t}=e;if("success"!==t&&"error"!==t)throw new Error(`Unexpected submission result (kind: ${t})`)}var S,C=e=>new O(e),_=()=>(S||(S=C()),S);return P}I("cardNumber",A),I("cardExpiry",A),I("cardCvc",A),I("fpxBank",A),I("iban",A),I("idealBank",A),I("p24Bank",A),I("epsBank",A),I("payment",A),I("payButton",A),I("paymentRequestButton",A),I("linkAuthentication",A),I("address",A),I("shippingAddress",A),I("cart",A),I("paymentMethodMessaging",A),I("affirmMessage",A),I("afterpayClearpayMessage",A);var D,N,F=R(),L={};function M(){if(D)return L;function e(t){return(e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(t)}D=1,Object.defineProperty(L,"__esModule",{value:!0});var t,r="https://js.stripe.com/v3",n=/^https:\/\/js\.stripe\.com\/v3\/?(\?.*)?$/,o=null,a=function(e){return null!==o||(o=new Promise(function(t,o){if("undefined"!=typeof window&&"undefined"!=typeof document)if(window.Stripe,window.Stripe)t(window.Stripe);else try{var a=function(){for(var e=document.querySelectorAll('script[src^="'.concat(r,'"]')),t=0;t<e.length;t++){var o=e[t];if(n.test(o.src))return o}return null}();a&&e||a||(a=function(e){var t=e&&!e.advancedFraudSignals?"?advancedFraudSignals=false":"",n=document.createElement("script");n.src="".concat(r).concat(t);var o=document.head||document.body;if(!o)throw new Error("Expected document.body not to be null. Stripe.js requires a <body> element.");return o.appendChild(n),n}(e)),a.addEventListener("load",function(){window.Stripe?t(window.Stripe):o(new Error("Stripe.js not available"))}),a.addEventListener("error",function(){o(new Error("Failed to load Stripe.js"))})}catch(i){return void o(i)}else t(null)})),o},i=function(t){var r="invalid load parameters; expected object of shape\n\n    {advancedFraudSignals: boolean}\n\nbut received\n\n    ".concat(JSON.stringify(t),"\n");if(null===t||"object"!==e(t))throw new Error(r);if(1===Object.keys(t).length&&"boolean"==typeof t.advancedFraudSignals)return t;throw new Error(r)},s=!1,c=function(){for(var e=arguments.length,r=new Array(e),n=0;n<e;n++)r[n]=arguments[n];s=!0;var o=Date.now();return a(t).then(function(e){return function(e,t,r){if(null===e)return null;var n=e.apply(void 0,t);return function(e,t){e&&e._registerWrapper&&e._registerWrapper({name:"stripe-js",version:"1.54.2",startTime:t})}(n,r),n}(e,r,o)})};return c.setLoadParameters=function(e){if(s&&t){var r=i(e);if(Object.keys(r).reduce(function(r,n){var o;return r&&e[n]===(null===(o=t)||void 0===o?void 0:o[n])},!0))return}if(s)throw new Error("You cannot change load parameters after calling loadStripe");t=i(e)},L.loadStripe=c,L}N||(N=1,M());var $=t.createContext({elements:null});var U=e.createContext(null);function Y(e,r={}){let n=t.useContext(U)??{client:F.getDefaultClient()},{elements:o}=t.useContext($),{client:a=n.client,extraData:i,onError:s,onSuccess:c,origin:l}=r,{stripe:u}=a;return async function(t){let r=function(e){return"preventDefault"in e&&"function"==typeof e.preventDefault}(t)?function(e){e.preventDefault();let t=e.currentTarget;if("FORM"!=t.tagName)throw new Error("submit was triggered for a non-form element");return new FormData(t)}(t):t;if("object"==typeof i)for(let[e,o]of Object.entries(i)){let t;t="function"==typeof o?await o():o,void 0!==t&&F.appendExtraData(r,e,t)}let n=o?.getElement(k),d=u&&n?()=>u.createPaymentMethod({type:"card",card:n,billing_details:B(r)}):void 0,f=await a.submitForm(e,r,{endpoint:l,clientName:"@formspree/react@2.5.5",createPaymentMethod:d});F.isSubmissionError(f)?s?.(f):c?.(f)}}function B(e){let t={address:z(e)};for(let r of["name","email","phone"]){let n=e instanceof FormData?e.get(r):e[r];n&&"string"==typeof n&&(t[r]=n)}return t}function z(e){let t={};for(let[r,n]of[["address_line1","line1"],["address_line2","line2"],["address_city","city"],["address_country","country"],["address_state","state"],["address_postal_code","postal_code"]]){let o=e instanceof FormData?e.get(r):e[r];o&&"string"==typeof o&&(t[n]=o)}return t}function K(e,r={}){let[n,o]=t.useState(null),[a,i]=t.useState(null),[s,c]=t.useState(!1),[l,u]=t.useState(!1);if(!e)throw new Error('You must provide a form key or hashid (e.g. useForm("myForm") or useForm("123xyz")');let d=Y(e,{client:r.client,extraData:r.data,onError(e){o(e),c(!1),u(!1)},onSuccess(e){o(null),i(e),c(!1),u(!0)},origin:r.endpoint});return[{errors:n,result:a,submitting:s,succeeded:l},async function(e){c(!0),await d(e)},function(){o(null),i(null),c(!1),u(!1)}]}let q,H,J,W={data:""},V=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,Z=/\/\*[^]*?\*\/|  +/g,G=/\n+/g,Q=(e,t)=>{let r="",n="",o="";for(let a in e){let i=e[a];"@"==a[0]?"i"==a[1]?r=a+" "+i+";":n+="f"==a[1]?Q(i,a):a+"{"+Q(i,"k"==a[1]?"":t)+"}":"object"==typeof i?n+=Q(i,t?t.replace(/([^,])+/g,e=>a.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):a):null!=i&&(a=/^--/.test(a)?a:a.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=Q.p?Q.p(a,i):a+":"+i+";")}return r+(t&&o?t+"{"+o+"}":o)+n},X={},ee=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+ee(e[r]);return t}return e};function te(e){let t=this||{},r=e.call?e(t.p):e;return((e,t,r,n,o)=>{let a=ee(e),i=X[a]||(X[a]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(a));if(!X[i]){let t=a!==e?e:(e=>{let t,r,n=[{}];for(;t=V.exec(e.replace(Z,""));)t[4]?n.shift():t[3]?(r=t[3].replace(G," ").trim(),n.unshift(n[0][r]=n[0][r]||{})):n[0][t[1]]=t[2].replace(G," ").trim();return n[0]})(e);X[i]=Q(o?{["@keyframes "+i]:t}:t,r?"":"."+i)}let s=r&&X.g?X.g:null;return r&&(X.g=X[i]),c=X[i],l=t,u=n,(d=s)?l.data=l.data.replace(d,c):-1===l.data.indexOf(c)&&(l.data=u?c+l.data:l.data+c),i;var c,l,u,d})(r.unshift?r.raw?((e,t,r)=>e.reduce((e,n,o)=>{let a=t[o];if(a&&a.call){let e=a(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;a=t?"."+t:e&&"object"==typeof e?e.props?"":Q(e,""):!1===e?"":e}return e+n+(null==a?"":a)},""))(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,(n=t.target,"object"==typeof window?((n?n.querySelector("#_goober"):window._goober)||Object.assign((n||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:n||W),t.g,t.o,t.k);var n}te.bind({g:1});let re=te.bind({k:1});function ne(e,t){let r=this||{};return function(){let t=arguments;return function n(o,a){let i=Object.assign({},o),s=i.className||n.className;r.p=Object.assign({theme:H&&H()},i),r.o=/ *go\d+/.test(s),i.className=te.apply(r,t)+(s?" "+s:"");let c=e;return e[0]&&(c=i.as||e,delete i.as),J&&c[0]&&J(i),q(c,i)}}}var oe=(e,t)=>(e=>"function"==typeof e)(e)?e(t):e,ae=(()=>{let e=0;return()=>(++e).toString()})(),ie=(()=>{let e;return()=>{if(void 0===e&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),se="default",ce=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:n}=t;return ce(e,{type:e.toasts.find(e=>e.id===n.id)?1:0,toast:n});case 3:let{toastId:o}=t;return{...e,toasts:e.toasts.map(e=>e.id===o||void 0===o?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let a=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+a}))}}},le=[],ue={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},de={},fe=(e,t=se)=>{de[t]=ce(de[t]||ue,e),le.forEach(([e,r])=>{e===t&&r(de[t])})},pe=e=>Object.keys(de).forEach(t=>fe(e,t)),me=(e=se)=>t=>{fe(t,e)},ye={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},he=e=>(t,r)=>{let n=((e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||ae()}))(t,e,r);return me(n.toasterId||(e=>Object.keys(de).find(t=>de[t].toasts.some(t=>t.id===e)))(n.id))({type:2,toast:n}),n.id},ge=(e,t)=>he("blank")(e,t);ge.error=he("error"),ge.success=he("success"),ge.loading=he("loading"),ge.custom=he("custom"),ge.dismiss=(e,t)=>{let r={type:3,toastId:e};t?me(t)(r):pe(r)},ge.dismissAll=e=>ge.dismiss(void 0,e),ge.remove=(e,t)=>{let r={type:4,toastId:e};t?me(t)(r):pe(r)},ge.removeAll=e=>ge.remove(void 0,e),ge.promise=(e,t,r)=>{let n=ge.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let o=t.success?oe(t.success,e):void 0;return o?ge.success(o,{id:n,...r,...null==r?void 0:r.success}):ge.dismiss(n),e}).catch(e=>{let o=t.error?oe(t.error,e):void 0;o?ge.error(o,{id:n,...r,...null==r?void 0:r.error}):ge.dismiss(n)}),e};var be,ve,Ee,we,Oe=(e,r="default")=>{let{toasts:n,pausedAt:o}=((e={},r=se)=>{let[n,o]=t.useState(de[r]||ue),a=t.useRef(de[r]);t.useEffect(()=>(a.current!==de[r]&&o(de[r]),le.push([r,o]),()=>{let e=le.findIndex(([e])=>e===r);e>-1&&le.splice(e,1)}),[r]);let i=n.toasts.map(t=>{var r,n,o;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(n=e[t.type])?void 0:n.duration)||(null==e?void 0:e.duration)||ye[t.type],style:{...e.style,...null==(o=e[t.type])?void 0:o.style,...t.style}}});return{...n,toasts:i}})(e,r),a=t.useRef(new Map).current,i=t.useCallback((e,t=1e3)=>{if(a.has(e))return;let r=setTimeout(()=>{a.delete(e),s({type:4,toastId:e})},t);a.set(e,r)},[]);t.useEffect(()=>{if(o)return;let e=Date.now(),t=n.map(t=>{if(t.duration===1/0)return;let n=(t.duration||0)+t.pauseDuration-(e-t.createdAt);if(!(n<0))return setTimeout(()=>ge.dismiss(t.id,r),n);t.visible&&ge.dismiss(t.id)});return()=>{t.forEach(e=>e&&clearTimeout(e))}},[n,o,r]);let s=t.useCallback(me(r),[r]),c=t.useCallback(()=>{s({type:5,time:Date.now()})},[s]),l=t.useCallback((e,t)=>{s({type:1,toast:{id:e,height:t}})},[s]),u=t.useCallback(()=>{o&&s({type:6,time:Date.now()})},[o,s]),d=t.useCallback((e,t)=>{let{reverseOrder:r=!1,gutter:o=8,defaultPosition:a}=t||{},i=n.filter(t=>(t.position||a)===(e.position||a)&&t.height),s=i.findIndex(t=>t.id===e.id),c=i.filter((e,t)=>t<s&&e.visible).length;return i.filter(e=>e.visible).slice(...r?[c+1]:[0,c]).reduce((e,t)=>e+(t.height||0)+o,0)},[n]);return t.useEffect(()=>{n.forEach(e=>{if(e.dismissed)i(e.id,e.removeDelay);else{let t=a.get(e.id);t&&(clearTimeout(t),a.delete(e.id))}})},[n,i]),{toasts:n,handlers:{updateHeight:l,startPause:c,endPause:u,calculateOffset:d}}},xe=re`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,Se=re`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Ce=re`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,_e=ne("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${xe} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${Se} 0.15s ease-out forwards;
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
    animation: ${Ce} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,je=re`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,Ie=ne("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${je} 1s linear infinite;
`,Ae=re`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,Pe=re`
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
}`,Te=ne("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Ae} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${Pe} 0.2s ease-out forwards;
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
`,ke=ne("div")`
  position: absolute;
`,Re=ne("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,De=re`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Ne=ne("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${De} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,Fe=({toast:e})=>{let{icon:r,type:n,iconTheme:o}=e;return void 0!==r?"string"==typeof r?t.createElement(Ne,null,r):r:"blank"===n?null:t.createElement(Re,null,t.createElement(Ie,{...o}),"loading"!==n&&t.createElement(ke,null,"error"===n?t.createElement(_e,{...o}):t.createElement(Te,{...o})))},Le=e=>`\n0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}\n100% {transform: translate3d(0,0,0) scale(1); opacity:1;}\n`,Me=e=>`\n0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}\n100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}\n`,$e=ne("div")`
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
`,Ue=ne("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Ye=t.memo(({toast:e,position:r,style:n,children:o})=>{let a=e.height?((e,t)=>{let r=e.includes("top")?1:-1,[n,o]=ie()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[Le(r),Me(r)];return{animation:t?`${re(n)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${re(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||r||"top-center",e.visible):{opacity:0},i=t.createElement(Fe,{toast:e}),s=t.createElement(Ue,{...e.ariaProps},oe(e.message,e));return t.createElement($e,{className:e.className,style:{...a,...n,...e.style}},"function"==typeof o?o({icon:i,message:s}):t.createElement(t.Fragment,null,i,s))});be=t.createElement,Q.p=ve,q=be,H=Ee,J=we;var Be=({id:e,className:r,style:n,onHeightUpdate:o,children:a})=>{let i=t.useCallback(t=>{if(t){let r=()=>{let r=t.getBoundingClientRect().height;o(e,r)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,o]);return t.createElement("div",{ref:i,className:r,style:n},a)},ze=te`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,Ke=({reverseOrder:e,position:r="top-center",toastOptions:n,gutter:o,children:a,toasterId:i,containerStyle:s,containerClassName:c})=>{let{toasts:l,handlers:u}=Oe(n,i);return t.createElement("div",{"data-rht-toaster":i||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...s},className:c,onMouseEnter:u.startPause,onMouseLeave:u.endPause},l.map(n=>{let i=n.position||r,s=((e,t)=>{let r=e.includes("top"),n=r?{top:0}:{bottom:0},o=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:ie()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...n,...o}})(i,u.calculateOffset(n,{reverseOrder:e,gutter:o,defaultPosition:r}));return t.createElement(Be,{id:n.id,key:n.id,onHeightUpdate:u.updateHeight,className:n.visible?ze:"",style:s},"custom"===n.type?oe(n.message,n):a?a(n):t.createElement(Ye,{toast:n,position:i}))}))},qe=ge;export{Ke as F,f as P,K as X,qe as z};
