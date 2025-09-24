"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/debug-tables/route";
exports.ids = ["app/api/debug-tables/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fdebug-tables%2Froute&page=%2Fapi%2Fdebug-tables%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdebug-tables%2Froute.ts&appDir=D%3A%5CUsers%5Cenyoc%5CDocuments%5CDev%5Ceasner%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CUsers%5Cenyoc%5CDocuments%5CDev%5Ceasner&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fdebug-tables%2Froute&page=%2Fapi%2Fdebug-tables%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdebug-tables%2Froute.ts&appDir=D%3A%5CUsers%5Cenyoc%5CDocuments%5CDev%5Ceasner%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CUsers%5Cenyoc%5CDocuments%5CDev%5Ceasner&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_Users_enyoc_Documents_Dev_easner_app_api_debug_tables_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/debug-tables/route.ts */ \"(rsc)/./app/api/debug-tables/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/debug-tables/route\",\n        pathname: \"/api/debug-tables\",\n        filename: \"route\",\n        bundlePath: \"app/api/debug-tables/route\"\n    },\n    resolvedPagePath: \"D:\\\\Users\\\\enyoc\\\\Documents\\\\Dev\\\\easner\\\\app\\\\api\\\\debug-tables\\\\route.ts\",\n    nextConfigOutput,\n    userland: D_Users_enyoc_Documents_Dev_easner_app_api_debug_tables_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/debug-tables/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZkZWJ1Zy10YWJsZXMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmRlYnVnLXRhYmxlcyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmRlYnVnLXRhYmxlcyUyRnJvdXRlLnRzJmFwcERpcj1EJTNBJTVDVXNlcnMlNUNlbnlvYyU1Q0RvY3VtZW50cyU1Q0RldiU1Q2Vhc25lciU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9RCUzQSU1Q1VzZXJzJTVDZW55b2MlNUNEb2N1bWVudHMlNUNEZXYlNUNlYXNuZXImaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQzBCO0FBQ3ZHO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZWFzbmVyLz8wOTA2Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkQ6XFxcXFVzZXJzXFxcXGVueW9jXFxcXERvY3VtZW50c1xcXFxEZXZcXFxcZWFzbmVyXFxcXGFwcFxcXFxhcGlcXFxcZGVidWctdGFibGVzXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9kZWJ1Zy10YWJsZXMvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9kZWJ1Zy10YWJsZXNcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2RlYnVnLXRhYmxlcy9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkQ6XFxcXFVzZXJzXFxcXGVueW9jXFxcXERvY3VtZW50c1xcXFxEZXZcXFxcZWFzbmVyXFxcXGFwcFxcXFxhcGlcXFxcZGVidWctdGFibGVzXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9kZWJ1Zy10YWJsZXMvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fdebug-tables%2Froute&page=%2Fapi%2Fdebug-tables%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdebug-tables%2Froute.ts&appDir=D%3A%5CUsers%5Cenyoc%5CDocuments%5CDev%5Ceasner%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CUsers%5Cenyoc%5CDocuments%5CDev%5Ceasner&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/debug-tables/route.ts":
/*!***************************************!*\
  !*** ./app/api/debug-tables/route.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _lib_supabase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/supabase */ \"(rsc)/./lib/supabase.ts\");\n// Debug endpoint to check database tables\n\n\nasync function GET(request) {\n    try {\n        const supabase = (0,_lib_supabase__WEBPACK_IMPORTED_MODULE_1__.createServerClient)();\n        // Check users table\n        const { data: users, error: usersError } = await supabase.from(\"users\").select(\"id, email\").limit(5);\n        // Check recipients table\n        const { data: recipients, error: recipientsError } = await supabase.from(\"recipients\").select(\"id, full_name\").limit(5);\n        // Check transactions table\n        const { data: transactions, error: transactionsError } = await supabase.from(\"transactions\").select(\"transaction_id, status\").limit(5);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            users: {\n                count: users?.length || 0,\n                error: usersError?.message,\n                data: users\n            },\n            recipients: {\n                count: recipients?.length || 0,\n                error: recipientsError?.message,\n                data: recipients\n            },\n            transactions: {\n                count: transactions?.length || 0,\n                error: transactionsError?.message,\n                data: transactions\n            }\n        });\n    } catch (error) {\n        console.error(\"Debug tables error:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Debug tables failed\",\n            details: error instanceof Error ? error.message : \"Unknown error\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2RlYnVnLXRhYmxlcy9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwwQ0FBMEM7QUFFYTtBQUNKO0FBRTVDLGVBQWVFLElBQUlDLE9BQW9CO0lBQzVDLElBQUk7UUFDRixNQUFNQyxXQUFXSCxpRUFBa0JBO1FBRW5DLG9CQUFvQjtRQUNwQixNQUFNLEVBQUVJLE1BQU1DLEtBQUssRUFBRUMsT0FBT0MsVUFBVSxFQUFFLEdBQUcsTUFBTUosU0FDOUNLLElBQUksQ0FBQyxTQUNMQyxNQUFNLENBQUMsYUFDUEMsS0FBSyxDQUFDO1FBRVQseUJBQXlCO1FBQ3pCLE1BQU0sRUFBRU4sTUFBTU8sVUFBVSxFQUFFTCxPQUFPTSxlQUFlLEVBQUUsR0FBRyxNQUFNVCxTQUN4REssSUFBSSxDQUFDLGNBQ0xDLE1BQU0sQ0FBQyxpQkFDUEMsS0FBSyxDQUFDO1FBRVQsMkJBQTJCO1FBQzNCLE1BQU0sRUFBRU4sTUFBTVMsWUFBWSxFQUFFUCxPQUFPUSxpQkFBaUIsRUFBRSxHQUFHLE1BQU1YLFNBQzVESyxJQUFJLENBQUMsZ0JBQ0xDLE1BQU0sQ0FBQywwQkFDUEMsS0FBSyxDQUFDO1FBRVQsT0FBT1gscURBQVlBLENBQUNnQixJQUFJLENBQUM7WUFDdkJDLFNBQVM7WUFDVFgsT0FBTztnQkFDTFksT0FBT1osT0FBT2EsVUFBVTtnQkFDeEJaLE9BQU9DLFlBQVlZO2dCQUNuQmYsTUFBTUM7WUFDUjtZQUNBTSxZQUFZO2dCQUNWTSxPQUFPTixZQUFZTyxVQUFVO2dCQUM3QlosT0FBT00saUJBQWlCTztnQkFDeEJmLE1BQU1PO1lBQ1I7WUFDQUUsY0FBYztnQkFDWkksT0FBT0osY0FBY0ssVUFBVTtnQkFDL0JaLE9BQU9RLG1CQUFtQks7Z0JBQzFCZixNQUFNUztZQUNSO1FBQ0Y7SUFDRixFQUFFLE9BQU9QLE9BQU87UUFDZGMsUUFBUWQsS0FBSyxDQUFDLHVCQUF1QkE7UUFDckMsT0FBT1AscURBQVlBLENBQUNnQixJQUFJLENBQUM7WUFDdkJULE9BQU87WUFDUGUsU0FBU2YsaUJBQWlCZ0IsUUFBUWhCLE1BQU1hLE9BQU8sR0FBRztRQUNwRCxHQUFHO1lBQUVJLFFBQVE7UUFBSTtJQUNuQjtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZWFzbmVyLy4vYXBwL2FwaS9kZWJ1Zy10YWJsZXMvcm91dGUudHM/NTVjNyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBEZWJ1ZyBlbmRwb2ludCB0byBjaGVjayBkYXRhYmFzZSB0YWJsZXNcclxuXHJcbmltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIlxyXG5pbXBvcnQgeyBjcmVhdGVTZXJ2ZXJDbGllbnQgfSBmcm9tIFwiQC9saWIvc3VwYWJhc2VcIlxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVChyZXF1ZXN0OiBOZXh0UmVxdWVzdCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZVNlcnZlckNsaWVudCgpXHJcbiAgICBcclxuICAgIC8vIENoZWNrIHVzZXJzIHRhYmxlXHJcbiAgICBjb25zdCB7IGRhdGE6IHVzZXJzLCBlcnJvcjogdXNlcnNFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAgLmZyb20oJ3VzZXJzJylcclxuICAgICAgLnNlbGVjdCgnaWQsIGVtYWlsJylcclxuICAgICAgLmxpbWl0KDUpXHJcblxyXG4gICAgLy8gQ2hlY2sgcmVjaXBpZW50cyB0YWJsZVxyXG4gICAgY29uc3QgeyBkYXRhOiByZWNpcGllbnRzLCBlcnJvcjogcmVjaXBpZW50c0Vycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAuZnJvbSgncmVjaXBpZW50cycpXHJcbiAgICAgIC5zZWxlY3QoJ2lkLCBmdWxsX25hbWUnKVxyXG4gICAgICAubGltaXQoNSlcclxuXHJcbiAgICAvLyBDaGVjayB0cmFuc2FjdGlvbnMgdGFibGVcclxuICAgIGNvbnN0IHsgZGF0YTogdHJhbnNhY3Rpb25zLCBlcnJvcjogdHJhbnNhY3Rpb25zRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXHJcbiAgICAgIC5mcm9tKCd0cmFuc2FjdGlvbnMnKVxyXG4gICAgICAuc2VsZWN0KCd0cmFuc2FjdGlvbl9pZCwgc3RhdHVzJylcclxuICAgICAgLmxpbWl0KDUpXHJcblxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgdXNlcnM6IHtcclxuICAgICAgICBjb3VudDogdXNlcnM/Lmxlbmd0aCB8fCAwLFxyXG4gICAgICAgIGVycm9yOiB1c2Vyc0Vycm9yPy5tZXNzYWdlLFxyXG4gICAgICAgIGRhdGE6IHVzZXJzXHJcbiAgICAgIH0sXHJcbiAgICAgIHJlY2lwaWVudHM6IHtcclxuICAgICAgICBjb3VudDogcmVjaXBpZW50cz8ubGVuZ3RoIHx8IDAsXHJcbiAgICAgICAgZXJyb3I6IHJlY2lwaWVudHNFcnJvcj8ubWVzc2FnZSxcclxuICAgICAgICBkYXRhOiByZWNpcGllbnRzXHJcbiAgICAgIH0sXHJcbiAgICAgIHRyYW5zYWN0aW9uczoge1xyXG4gICAgICAgIGNvdW50OiB0cmFuc2FjdGlvbnM/Lmxlbmd0aCB8fCAwLFxyXG4gICAgICAgIGVycm9yOiB0cmFuc2FjdGlvbnNFcnJvcj8ubWVzc2FnZSxcclxuICAgICAgICBkYXRhOiB0cmFuc2FjdGlvbnNcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRGVidWcgdGFibGVzIGVycm9yOicsIGVycm9yKVxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgXHJcbiAgICAgIGVycm9yOiAnRGVidWcgdGFibGVzIGZhaWxlZCcsXHJcbiAgICAgIGRldGFpbHM6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InXHJcbiAgICB9LCB7IHN0YXR1czogNTAwIH0pXHJcbiAgfVxyXG59XHJcbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJjcmVhdGVTZXJ2ZXJDbGllbnQiLCJHRVQiLCJyZXF1ZXN0Iiwic3VwYWJhc2UiLCJkYXRhIiwidXNlcnMiLCJlcnJvciIsInVzZXJzRXJyb3IiLCJmcm9tIiwic2VsZWN0IiwibGltaXQiLCJyZWNpcGllbnRzIiwicmVjaXBpZW50c0Vycm9yIiwidHJhbnNhY3Rpb25zIiwidHJhbnNhY3Rpb25zRXJyb3IiLCJqc29uIiwic3VjY2VzcyIsImNvdW50IiwibGVuZ3RoIiwibWVzc2FnZSIsImNvbnNvbGUiLCJkZXRhaWxzIiwiRXJyb3IiLCJzdGF0dXMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/debug-tables/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/supabase.ts":
/*!*************************!*\
  !*** ./lib/supabase.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   createServerClient: () => (/* binding */ createServerClient),\n/* harmony export */   getCurrentUser: () => (/* binding */ getCurrentUser),\n/* harmony export */   signOut: () => (/* binding */ signOut),\n/* harmony export */   supabase: () => (/* binding */ supabase)\n/* harmony export */ });\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n\nconst supabaseUrl = \"https://seeqjiebmrnolcyydewj.supabase.co\";\nconst supabaseAnonKey = \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZXFqaWVibXJub2xjeXlkZXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTIxMTksImV4cCI6MjA2OTI2ODExOX0.7wc1OxdPCuhpBgPZY-pQAdjjOO8VbKdb3O47IQjd4Fc\";\nif (!supabaseUrl || !supabaseAnonKey) {\n    throw new Error(\"Missing Supabase environment variables\");\n}\n// Client-side Supabase client (singleton pattern)\nconst supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, supabaseAnonKey, {\n    auth: {\n        persistSession: true,\n        autoRefreshToken: true,\n        detectSessionInUrl: true\n    },\n    global: {\n        headers: {\n            \"X-Client-Info\": \"easner-web-app\"\n        }\n    }\n});\n// Server-side client for admin operations\nconst createServerClient = ()=>{\n    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;\n    if (!serviceRoleKey) {\n        throw new Error(\"Missing SUPABASE_SERVICE_ROLE_KEY environment variable\");\n    }\n    return (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_0__.createClient)(supabaseUrl, serviceRoleKey, {\n        auth: {\n            persistSession: false,\n            autoRefreshToken: false\n        }\n    });\n};\n// Auth helper functions\nconst getCurrentUser = async ()=>{\n    const { data: { user }, error } = await supabase.auth.getUser();\n    if (error) throw error;\n    return user;\n};\nconst signOut = async ()=>{\n    const { error } = await supabase.auth.signOut();\n    if (error) throw error;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3VwYWJhc2UudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBb0Q7QUFFcEQsTUFBTUMsY0FBY0MsMENBQW9DO0FBQ3hELE1BQU1HLGtCQUFrQkgsa05BQXlDO0FBRWpFLElBQUksQ0FBQ0QsZUFBZSxDQUFDSSxpQkFBaUI7SUFDcEMsTUFBTSxJQUFJRSxNQUFNO0FBQ2xCO0FBRUEsa0RBQWtEO0FBQzNDLE1BQU1DLFdBQVdSLG1FQUFZQSxDQUFDQyxhQUFhSSxpQkFBaUI7SUFDakVJLE1BQU07UUFDSkMsZ0JBQWdCO1FBQ2hCQyxrQkFBa0I7UUFDbEJDLG9CQUFvQjtJQUN0QjtJQUNBQyxRQUFRO1FBQ05DLFNBQVM7WUFDUCxpQkFBaUI7UUFDbkI7SUFDRjtBQUNGLEdBQUU7QUFFRiwwQ0FBMEM7QUFDbkMsTUFBTUMscUJBQXFCO0lBQ2hDLE1BQU1DLGlCQUFpQmQsUUFBUUMsR0FBRyxDQUFDYyx5QkFBeUI7SUFFNUQsSUFBSSxDQUFDRCxnQkFBZ0I7UUFDbkIsTUFBTSxJQUFJVCxNQUFNO0lBQ2xCO0lBRUEsT0FBT1AsbUVBQVlBLENBQUNDLGFBQWFlLGdCQUFnQjtRQUMvQ1AsTUFBTTtZQUNKQyxnQkFBZ0I7WUFDaEJDLGtCQUFrQjtRQUNwQjtJQUNGO0FBQ0YsRUFBQztBQUVELHdCQUF3QjtBQUNqQixNQUFNTyxpQkFBaUI7SUFDNUIsTUFBTSxFQUNKQyxNQUFNLEVBQUVDLElBQUksRUFBRSxFQUNkQyxLQUFLLEVBQ04sR0FBRyxNQUFNYixTQUFTQyxJQUFJLENBQUNhLE9BQU87SUFDL0IsSUFBSUQsT0FBTyxNQUFNQTtJQUNqQixPQUFPRDtBQUNULEVBQUM7QUFFTSxNQUFNRyxVQUFVO0lBQ3JCLE1BQU0sRUFBRUYsS0FBSyxFQUFFLEdBQUcsTUFBTWIsU0FBU0MsSUFBSSxDQUFDYyxPQUFPO0lBQzdDLElBQUlGLE9BQU8sTUFBTUE7QUFDbkIsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2Vhc25lci8uL2xpYi9zdXBhYmFzZS50cz9jOTlmIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gXCJAc3VwYWJhc2Uvc3VwYWJhc2UtanNcIlxuXG5jb25zdCBzdXBhYmFzZVVybCA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCFcbmNvbnN0IHN1cGFiYXNlQW5vbktleSA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX0FOT05fS0VZIVxuXG5pZiAoIXN1cGFiYXNlVXJsIHx8ICFzdXBhYmFzZUFub25LZXkpIHtcbiAgdGhyb3cgbmV3IEVycm9yKFwiTWlzc2luZyBTdXBhYmFzZSBlbnZpcm9ubWVudCB2YXJpYWJsZXNcIilcbn1cblxuLy8gQ2xpZW50LXNpZGUgU3VwYWJhc2UgY2xpZW50IChzaW5nbGV0b24gcGF0dGVybilcbmV4cG9ydCBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudChzdXBhYmFzZVVybCwgc3VwYWJhc2VBbm9uS2V5LCB7XG4gIGF1dGg6IHtcbiAgICBwZXJzaXN0U2Vzc2lvbjogdHJ1ZSxcbiAgICBhdXRvUmVmcmVzaFRva2VuOiB0cnVlLFxuICAgIGRldGVjdFNlc3Npb25JblVybDogdHJ1ZSwgLy8gQmV0dGVyIHNlc3Npb24gZGV0ZWN0aW9uIGZvciBSTFNcbiAgfSxcbiAgZ2xvYmFsOiB7XG4gICAgaGVhZGVyczoge1xuICAgICAgJ1gtQ2xpZW50LUluZm8nOiAnZWFzbmVyLXdlYi1hcHAnXG4gICAgfVxuICB9XG59KVxuXG4vLyBTZXJ2ZXItc2lkZSBjbGllbnQgZm9yIGFkbWluIG9wZXJhdGlvbnNcbmV4cG9ydCBjb25zdCBjcmVhdGVTZXJ2ZXJDbGllbnQgPSAoKSA9PiB7XG4gIGNvbnN0IHNlcnZpY2VSb2xlS2V5ID0gcHJvY2Vzcy5lbnYuU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWVxuXG4gIGlmICghc2VydmljZVJvbGVLZXkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIFNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkgZW52aXJvbm1lbnQgdmFyaWFibGVcIilcbiAgfVxuXG4gIHJldHVybiBjcmVhdGVDbGllbnQoc3VwYWJhc2VVcmwsIHNlcnZpY2VSb2xlS2V5LCB7XG4gICAgYXV0aDoge1xuICAgICAgcGVyc2lzdFNlc3Npb246IGZhbHNlLFxuICAgICAgYXV0b1JlZnJlc2hUb2tlbjogZmFsc2UsXG4gICAgfSxcbiAgfSlcbn1cblxuLy8gQXV0aCBoZWxwZXIgZnVuY3Rpb25zXG5leHBvcnQgY29uc3QgZ2V0Q3VycmVudFVzZXIgPSBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHtcbiAgICBkYXRhOiB7IHVzZXIgfSxcbiAgICBlcnJvcixcbiAgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0VXNlcigpXG4gIGlmIChlcnJvcikgdGhyb3cgZXJyb3JcbiAgcmV0dXJuIHVzZXJcbn1cblxuZXhwb3J0IGNvbnN0IHNpZ25PdXQgPSBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguc2lnbk91dCgpXG4gIGlmIChlcnJvcikgdGhyb3cgZXJyb3Jcbn1cbiJdLCJuYW1lcyI6WyJjcmVhdGVDbGllbnQiLCJzdXBhYmFzZVVybCIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwiLCJzdXBhYmFzZUFub25LZXkiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9BTk9OX0tFWSIsIkVycm9yIiwic3VwYWJhc2UiLCJhdXRoIiwicGVyc2lzdFNlc3Npb24iLCJhdXRvUmVmcmVzaFRva2VuIiwiZGV0ZWN0U2Vzc2lvbkluVXJsIiwiZ2xvYmFsIiwiaGVhZGVycyIsImNyZWF0ZVNlcnZlckNsaWVudCIsInNlcnZpY2VSb2xlS2V5IiwiU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSIsImdldEN1cnJlbnRVc2VyIiwiZGF0YSIsInVzZXIiLCJlcnJvciIsImdldFVzZXIiLCJzaWduT3V0Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/supabase.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/@supabase","vendor-chunks/next","vendor-chunks/whatwg-url","vendor-chunks/tr46","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fdebug-tables%2Froute&page=%2Fapi%2Fdebug-tables%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fdebug-tables%2Froute.ts&appDir=D%3A%5CUsers%5Cenyoc%5CDocuments%5CDev%5Ceasner%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CUsers%5Cenyoc%5CDocuments%5CDev%5Ceasner&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();