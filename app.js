var createError = require('http-errors');
var express = require('express');
var app     = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require('cors');
// var logger = require('morgan');
var mongoose = require('mongoose');
var AppTimviec = express();
// var AppRaonhanh = express();
// var AppVanthu = express();
var AppCRM = express();
// var AppQLC = express();
// var AppHR = express();
// var appQLTS = express();
// var AppGiaSu = express();
// var AppTinhluong = express();
// var AppViecLamTheoGio = express();
// var AppGiaoViec = express();
// var AppKPI = express();

function configureApp(app) {
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    // app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static('../storage'));
    app.use(cors());

    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
}

function errorApp(app) {
    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        next(createError(404));
    });

    // error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
}


// const cronJobHr = require('./controllers/tools/cronjob')
// cronJobHr.CronJobQuitJobs()
// Cấu hình appTimviec
configureApp(AppTimviec);
var timviecRouter = require('./routes/timviec');
var toolAddDataRouter = require('./routes/tools');
var dataRouter = require('./routes/data');

AppTimviec.use('/api/timviec', timviecRouter);
AppTimviec.use('/api/tool', toolAddDataRouter);
AppTimviec.use('/api/getData', dataRouter);
errorApp(AppTimviec);

// Cấu hình AppRaonhanh
// configureApp(AppRaonhanh);
// var raonhanhRouter = require('./routes/raonhanh');
// var raonhanhtool = require('./routes/raonhanh365/tools');
// AppRaonhanh.use('/api/raonhanh', raonhanhRouter);
// AppRaonhanh.use('/api/tool', raonhanhtool);
// errorApp(AppRaonhanh);

// // Cấu hình appVanthu
// configureApp(AppVanthu);
// var vanthuRouter = require('./routes/vanthu');
// AppVanthu.use('/api', vanthuRouter);
// errorApp(AppVanthu);

// // Cấu hình AppQLC
// configureApp(AppQLC);
// var qlcRouter = require('./routes/qlc');
// var ToolQLC = require('./routes/qlc/Tools');
// AppQLC.use('/api/qlc', qlcRouter);
// AppQLC.use('/api/tool', ToolQLC);
// errorApp(AppQLC);

// // Cấu hình AppHR
// configureApp(AppHR);
// var hrRouter = require('./routes/hr');
// AppHR.use('/api/hr', hrRouter);
// errorApp(AppHR);

//Cấu hình AppCRM
configureApp(AppCRM);
var CrmRouter = require('./routes/crm/CRMroutes');
AppCRM.use('/api/crm', CrmRouter);
errorApp(AppCRM);

// // Cấu hình appQLTS
// configureApp(appQLTS);
// var qltsRouter = require('./routes/qltsRouter');
// appQLTS.use('/api/qlts', qltsRouter);
// errorApp(appQLTS);

// // Cấu hình appGiaSu
// configureApp(AppGiaSu);
// var GiaSuRouter = require('./routes/giasu');
// AppGiaSu.use('/api/giasu', GiaSuRouter);
// errorApp(AppGiaSu);

// // Cấu hình AppTinhluongs
// configureApp(AppTinhluong);
// var tinhluongRouter = require('./routes/tinhluong');
// AppTinhluong.use('/api/tinhluong', tinhluongRouter);
// errorApp(AppTinhluong);

// // Cấu hình App Viec lam theo gio
// configureApp(AppViecLamTheoGio);
// var VLTGRouter = require('./routes/vieclamtheogio');
// AppViecLamTheoGio.use('/api/vltg', VLTGRouter);
// errorApp(AppViecLamTheoGio);

// // Cấu hình App Giao viec
// configureApp(AppGiaoViec);
// var giaoviecRouter = require('./routes/giaoviec');
// AppGiaoViec.use('/api/giaoviec', giaoviecRouter);
// errorApp(AppGiaoViec);


const DB_URL = 'mongodb://127.0.0.1:27017/api-base365';

// // Cấu hình App KPI
// configureApp(AppKPI);
// var KPIRouter = require('./routes/kpi');
// var ToolKPI = require('./routes/kpi/tools');
// AppKPI.use('/api/kpi', KPIRouter);
// AppKPI.use('/api/tool', ToolKPI);
// errorApp(AppKPI);

// const DB_URL = 'mongodb://127.0.0.1:27017/api-base365';
// const DB_URL = 'mongodb://localhost:27017';

mongoose
    .connect(DB_URL)
    .then(() => console.log('DB Connected!'))
    .catch((error) => console.log('DB connection error:', error.message));

// // Quản lý chung
// AppQLC.listen(3000, () => {
//     console.log(`QLC app is running on port 3000`);
// });

// AppQLC.on('error', (error) => {
//     console.error('Error occurred while listening on QLTS port:', error);
// });

AppTimviec.listen(3001, () => {
    console.log('Timviec365 app is running on port 3001');
});
AppTimviec.on('error', (error) => {
    console.error('Error occurred while listening on QLTS port:', error);
});
// Raonhanh
// AppRaonhanh.listen(3004, () => {
//     console.log(`Raonhanh app is running on port 3004`);
// });

// AppRaonhanh.on('error', (error) => {
//     console.error('Error occurred while listening on QLTS port:', error);
// });

// // // Van thu
// AppVanthu.listen(3005, () => {
//     console.log(`Vanthu app is running on port 3005`);
// });

// AppVanthu.on('error', (error) => {
//     console.error('Error occurred while listening on QLTS port:', error);
// });

// // // Quản trị nhân sự
// AppHR.listen(3006, () => {
//     console.log(`HR app is running on port 3006`);
// });

// AppHR.on('error', (error) => {
//     console.error('Error occurred while listening on QLTS port:', error);
// });

// Quản trị crm
AppCRM.listen(3007, () => {
    console.log(`CRM app is running on port 3007`);
});

AppCRM.on('error', (error) => {
    console.error('Error occurred while listening on QLTS port:', error);
});

// //qlts
// var serverQLTS = appQLTS.listen(3008, () => {
//     console.log(`qlts app is running on port 3008`);
// });

// serverQLTS.on('error', (error) => {
//     console.error('Error occurred while listening on QLTS port:', error);
// });

// //GiaSu
// AppGiaSu.listen(3009, () => {
//     console.log(`GiaSu app is running on port 3009`);
// });

// AppGiaSu.on('error', (error) => {
//     console.error('Error occurred while listening on GiaSu port:', error);
// });

// // Tính lương
// AppTinhluong.listen(3010, () => {
//     console.log(`Tinh luong app is running on port 3010`);
// });

// AppTinhluong.on('error', (error) => {
//     console.error('Error occurred while listening on QLTS port:', error);
// });

// // Giao viec
// AppGiaoViec.listen(3012, () => {
//     console.log(`Giao viec app is running on port 3012`);
// });

// AppGiaoViec.on('error', (error) => {
//     console.error('Error occurred while listening on giao viec port:', error);
// });

// // KPI
// AppKPI.listen(3015, () => {
//     console.log(`KPI app is running on port 3015`);
// });

// AppKPI.on('error', (error) => {
//     console.error('Error occurred while listening on kpi port:', error);
// });
module.exports = app;
