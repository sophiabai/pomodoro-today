const drinkingNumKey = 'drinkingNum';
const eatListIds = ['eatListB', 'eatListL', 'eatListD'];
const eatListKeyPostFix = '_total';
const eatCaloriesSpan = 100;
const STATUS_TODO = 0;
const STATUS_DONE = 1;

$(function() {
  // $("li").not("#drinkList li").append("<span class='close'>\u00D7</span>");

  $("input").attr("autocomplete", "off");
  $("input").css("font-family", "'FontAwesome','Roboto Mono', monospace");
  $("input").after("<span class='addBtn'></span>");
  $("#eatList .addBtn").remove();

  // drinking list
  $("#drinkList").on('click', 'li', function(e){
    e.preventDefault();
    e.stopPropagation();

    $(this).toggleClass('checked');
    var drinkingNum = $("#drinkList").find('li.checked').length;
    saveData(drinkingNumKey, drinkingNum);
  });

  // eat list
  $("#eatList").on('click', '.calorieMinus', function(e){
    e.preventDefault();
    e.stopPropagation();

    var eatListId = $(this).closest('.list-container').attr('id');
    var totalCaloriesContainer = $(this).siblings('.totalCalories');
    var totalCalories = parseInt(totalCaloriesContainer.text());
    var newCalories = Math.max(0, totalCalories - eatCaloriesSpan);
    totalCaloriesContainer.text(newCalories);
    saveData(eatListId + eatListKeyPostFix, newCalories);
  });
  
  $("#eatList").on('click', '.caloriePlus', function(e){
    e.preventDefault();
    e.stopPropagation();

    var eatListId = $(this).closest('.list-container').attr('id');
    var totalCaloriesContainer = $(this).siblings('.totalCalories');
    var totalCalories = parseInt(totalCaloriesContainer.text());
    var newCalories = totalCalories + eatCaloriesSpan;
    totalCaloriesContainer.text(newCalories);
    saveData(eatListId + eatListKeyPostFix, newCalories);
  });
  
  // others
  $(document).on('click', 'li.checkable', function(e) {
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
    resetData();
    location.reload();
  });

  $(document).on('click', '.addBtn', function() {
    saveElementValue($(this).siblings('input'));
  });

  $(document).on('keypress', 'input', function(event) {
    if (event.which == 13) {
      saveElementValue(this);
    }
  });

  var saveElementValue = function(inputEle) {
    var _val = $(inputEle).val().trim();
    $(inputEle).val("");

    if (_val.length === 0)
    {
      return;
    }

    $(inputEle).siblings("ul").prepend("<li class='checkable'><span>" + _val + "</span><span class='close'>\u00D7</span></li>");

    // modify data
    var key = $(inputEle).parent().get(0).id;
    var existingList = getData(key);

    if (!existingList)
    {
      existingList = [];
    }
    var newEntry = {'value': _val, 'status': STATUS_TODO};
    existingList.unshift(newEntry);
    saveData(key, existingList);
  };

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
          $("#" + key).children("ul").append("<li class='checkable " + (entry.status == STATUS_TODO ? "" : "checked") + "'><span>" + entry.value + "</span><span class='close'>\u00D7</span></li>");
        }
      }
    }
    // special treatment for eat lists
    loadEatListTotalCalories(key);
  }
});

var loadEatListTotalCalories = function(eatListId) {
  if (eatListIds.indexOf(eatListId) !== -1)
  {
    var totalCalories = parseInt(getData(eatListId + eatListKeyPostFix));
    if (isNaN(totalCalories))
    {
      totalCalories = 0;
    }
    $("#" + eatListId).children("ul").append("<li><span class='calorieMinus'>-</span><span class='totalCalories'>" + totalCalories + "</span><span class='caloriePlus'>+</span></li>");
  }
};

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

var resetData = function() {
  if (localStorage)
  {
    localStorage.clear();
  }
  else
  {
    chrome.storage.local.clear(function(result) {});
  }
};
