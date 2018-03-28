const drinkingNumKey = 'drinkingNum';
const STATUS_TODO = 0;
const STATUS_DONE = 1;

$(function() {
  $("li").not("#drinkList li").append("<span class='close'>\u00D7</span>");

  $("input").attr("autocomplete", "off");
  $("input").css("font-family", "'FontAwesome','Roboto Mono', monospace");
  $("input").after("<span class='addBtn'></span>");
  $("#eatList .addBtn").hide();

  // drinking list
  $("#drinkList").on('click', 'li', function(e){
    e.preventDefault();
    e.stopPropagation();

    $(this).toggleClass('checked');
    var drinkingNum = $("#drinkList").find('li.checked').length;
    saveData(drinkingNumKey, drinkingNum);
  });

  // others
  $(document).on('click', 'li', function(e) {
    e.preventDefault();
    e.stopPropagation();

    $(this).toggleClass('checked');

    // modify data
    var key = $(this).parent().parent().get(0).id;
    var text = $(this).children("span").eq(0).text();
    var existingList = getData(key);
    for (var i = 0; i < existingList.length; i++)
    {
      var entry = existingList[i];
      if (entry.value == text)
      {
        entry.status = entry.status == STATUS_TODO ? STATUS_DONE : STATUS_TODO;
        existingList[i] = entry;
        saveData(key, existingList);
        break;
      }
    }
  });

  $(document).on('click', '.close', function(e) {
    e.preventDefault();
    e.stopPropagation();

    // modify data
    var key = $(this).parent().parent().parent().get(0).id;
    var text = $(this).siblings("span").eq(0).text();
    var existingList = getData(key);
    for (var i = 0; i < existingList.length; i++)
    {
      var entry = existingList[i];
      if (entry.value == text)
      {
        existingList.splice(i, 1);
        saveData(key, existingList);
        break;
      }
    }
    $(this).parent().remove();

  });

  // reset
  $("#PomodoroReset").on("click", function() {
    $(".close").click();
    $("#drinkList li.checked").click();
  });

  $(".addBtn").click(function() {
    var _val = $(this).siblings("input").val();
    $(this).siblings("ul").prepend("<li><span>" + _val + "</span><span class='close'>\u00D7</span></li>");
    $(this).siblings("input").val("");

    // modify data
    var key = $(this).parent().get(0).id;
    var existingList = getData(key);

    if (!existingList)
    {
      existingList = [];
    }
    var newEntry = {'value': _val, 'status': STATUS_TODO};
    existingList.unshift(newEntry);
    saveData(key, existingList);
  });

  $("input").keypress(function(event) {
    if (event.which == 13) {
      $(this).siblings(".addBtn").click();
    }
  });

  // load values from storage on page load
  var drinkingNum = getData(drinkingNumKey);
  var drinkingCups = $("#drinkList").find('li');
  for(var i = 0; i < drinkingNum; i++)
  {
    drinkingCups.eq(i).addClass("checked");
  }

  var $containers = $(".list-container");
  for (var i = 0; i < $containers.length; i++)
  {
    var $container = $containers.get(i);
    var key = $container.id;
    if (key)
    {
      var list = getData(key);
      if (list)
      {
        for (var j = 0; j < list.length; j++)
        {
          var entry = list[j];
          $("#" + key).children("ul").append("<li class='" + (entry.status == STATUS_TODO ? "" : "checked") + "'><span>" + entry.value + "</span><span class='close'>\u00D7</span></li>");
        }
      }
    }
  }
});

var saveData = function(key, value) {
  value = JSON.stringify(value);
  if (localStorage)
  {
    localStorage.setItem(key, value);
    // console.log('saved ' + key + '-' + value);
  }
  else
  {
    chrome.storage.local.set({key: value}, function() {
      // console.log('saved ' + key + '-' + value);
    });
  }
};

var getData = function(key) {
  if (localStorage)
  {
    var value = localStorage.getItem(key);
    return JSON.parse(value);
  }
  else
  {
    chrome.storage.local.get(key, function(result) {
      return JSON.parse(result);
    });
  }
};