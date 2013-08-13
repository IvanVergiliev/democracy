/* courses tabs */
$('#coursesTab a[href="#not-enrolled"]').tab('show');
$('#coursesTab a').click(function(e) {
    e.preventDefault();
    $(this).tab('show');
});

/* tooltips */
$('#all-courses').tooltip({
    selector: "a[data-toggle=tooltip]"
});

// TODO(ivan): add a common way to get this - e.g. api /publicKey
var recaptchaPublic = '6Lcs7eUSAAAAAPXrTovFuQlWdKVe4LeJzTbu7GHb';

$('.showDescription').click(function() {
  $.get('templates/course_info.ejs', function (txt) {
    $('.modal').html(txt);
    $('#info-linux-sys-admin').modal('show');
  });
});

var showRecaptcha = function (publicKey) {
  Recaptcha.create(publicKey, 'recaptcha', {
    tabindex: 1,
    theme: "red",
    callback: Recaptcha.focus_response_field
  });
};

$('.showEnroll').click(function() {
  var id = this.dataset.id;
  var name = this.dataset.name;
  $.get('templates/enroll.ejs', function (txt) {
    $('.modal').html(ejs.render(txt, {_id: id, _name: name}));
    showRecaptcha(recaptchaPublic);
    $('#info-linux-sys-admin').modal('show');
  });
});

$('body').on('click', '.enroll', function () {
  var id = this.dataset.id;
  $.ajax({
    type: 'post',
    url: 'enroll',
    data: {
      courseId: id,
      challenge: Recaptcha.get_challenge(),
      response: Recaptcha.get_response()
    },
    success: function (json) {
      if (json.result === true) {
        $('.enrollResult').html('Готово!');
        $('a[data-id=' + id + '].unenroll').show();
        $('a[data-id=' + id + '].showEnroll').hide();
        $('a[data-id=' + id + '].enroll').hide();
      } else {
        $('.enrollResult').html(json.msg);
        if (json.result === 'recaptcha-error') {
          showRecaptcha(recaptchaPublic + '&error=' + json.error);
        }
      }
      $('.enrollResult').show();
    }
  });
  return false;
});

$('body').on('click', '.unenroll', function() {
  var id = this.dataset.id;
  $.ajax({
    type: 'get',
    url: 'unenroll/' + id,
    success: function (json) {
      if (json.result) {
        $('.unenrollStatus').html('Отписан!');
        $('a[data-id=' + id + '].showEnroll').show();
        $('a[data-id=' + id + '].unenroll').hide();
      }
    }
  });
  return false;
});

$('body').on('click', '.enqueue', function () {
  var id = this.dataset.id;
  $.ajax({
    type: 'get',
    url: 'enqueue/' + id,
    success: function (json) {
      if (json.result) {
        $('a[data-id=' + id + '].enqueue').hide();
        $('a[data-id=' + id + '].dequeue').show();
      }
    }
  });
  return false;
});

$('body').on('click', '.dequeue', function () {
  var id = this.dataset.id;
  $.ajax({
    type: 'get',
    url: 'dequeue/' + id,
    success: function (json) {
      if (json.result) {
        $('a[data-id=' + id + '].dequeue').hide();
        $('a[data-id=' + id + '].enqueue').show();
      }
    }
  });
  return false;
});

var filterRows = function (query) {
  $('.showDescription').each(function (index, item) {
    if (item.innerHTML.toLowerCase().indexOf(query.toLowerCase()) == -1) {
      $(item).parent().parent().hide();
    } else {
      $(item).parent().parent().show();
    }
  });
};

$('#filter').keyup(function () {
  filterRows(this.value);
});

$(function () {
  var currentUserId = document.body.dataset.id;
  var socket = io.connect();
  socket.emit('setUser', currentUserId);
  socket.on('stateChanged', function (userId, courseId, msg) {
    if (userId == currentUserId) {
      if (msg == 'Full') {
        $('[data-id=' + courseId + '].showEnroll').hide();
        $('[data-id=' + courseId + '].enqueue').show();
      }
    }
    console.log(arguments);
  });
});
