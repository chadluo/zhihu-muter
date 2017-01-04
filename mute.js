// ==UserScript==
// @name          Zhihu muter
// @description   Clean up timeline and question page.
// @include       http://*.zhihu.com/*
// @version 	  0.6

// will be replaced by 0 when run `publish.sh`
var DEBUG = 1;


/*
 * "Settings" function:
 Easily edit mute_id_list and mute_keywords_list,
 On/Off button: enable/disable "zh-trendings" in homepage, and "zh-question-related-questions".
 * Performance trace.
 * Combine duplicated codes between each function.
 */

// TO_MUTE
/*
 * articles written by ids that on mutelist.
 * "upvoted THESE answers" ->  feed-item folding feed-item-hook feed-item-a combine.
 */

// id and keyword list
var mutelist = ["eric-ann", "yolfilm", "cogito", "gracelu", "lawrencelry", "nixy", "zi-mo-qi", 
                "Fenng", "Hi-iD", "peng-yu-75-12", "Ratoo", "yang-guo-er-95", "xu-hui-lin", 
                "mu-peng-37", "e6kq", "luvletter_", "ios_dev", "wang-wei-62-88", "stormzhang", 
                "Hail_Hydra", "sunmengchao", "xing-tong-59-86];
var keywords = ["看待", "解读", "评价", "优雅", "如何", "评判", "却不", "体验", "但", "如何理解", "什么", "零基础", "鲜为人知", "特别急", "小众", "你", "有哪些", "现在", "孝", "冷知识", "中国", "阿姨", "刘仲敬", "工艺"];

var top_column_info_hidden = 1;
var you_may_not_want_to_know = 1;
var relevent_questions = 1;

/*

  var b = document.createElement("li");
  b.className = "top-nav-noti zu-top-nav-li ";
  b.innerHTML = '<a class="zu-top-nav-link" href="" class="zu-top-nav-link" id="zh-top-nav-count-wrap" role="button">遮蔽</a>';
  document.getElementsByClassName("zu-top-nav-ul zg-clear")[0].appendChild(b);

*/

var Magic = {
  authorInfo: 'zm-item-answer-author-info',
  answerComment: 'zm-comment-hd',
  timelineQlink: 'question_link',
  timelineFoldItem: 'div[class^="feed-item folding"]',
  topLeftLogo: 'zu-top-link-logo',
  topRightName: 'name',
  releventQuestions: 'zh-question-related-questions',

  event: 'scroll'
};


function hide(obj) {
  try {
    obj.style.display = 'none';
  }
  catch (err) {
    log(err);
  }
}

function log(msg) {
  if (DEBUG == 1) {
    console.log(msg);
  }
}



// 1. Answer
// 1.1 Answers by specific ids
function answer_mute(className, tomute) {
  var elements = document.getElementsByClassName(className);
  var n = elements.length;
  var mutelist_length = tomute.length;
  for (var i = 0; i < n; i++) {
    var e = elements[i];
    for (var j = 0; j < mutelist_length; j++) {
      var muteword = tomute[j];
      if (e.getElementsByClassName(Magic.authorInfo)[0].innerHTML.search(muteword) > -1) {
        hide(e);
      }
    }
  }
}
// test
/*   http://www.zhihu.com/question/26518222
     var muteword = 'su-chen-chuan'; // no offense
     var elements = document.getElementsByClassName('zm-item-answer');
     var n = elements.length;
     for (var i = 0; i < n; i++) {
     var answer = elements[i];
     if (answer.getElementsByClassName('zm-item-answer-author-info')[0].innerHTML.search(muteword) > -1) {
     //answer.style.display = 'none';
     //console.log(answer);
     }
     }
*/


// 1.2 Comments of answer
function comment_mute(className, tomute) {
  var elements = document.getElementsByClassName(className);
  var n = elements.length;
  for (var i = 0; i < n; i++) {
    var e = elements[i];
    for (var j = 0, len = tomute.length; j < len; j++) {
      var muteword = tomute[j];
      if (e.getElementsByClassName(Magic.answerComment)[0].innerHTML.search(muteword) > -1) {
        hide(e);
        //console.log(muteword)
      }
    }
  }
}

/* test
   http://www.zhihu.com/question/28256651/answer/40081422
   click "comments"

   var muteword = 'xiao-duan';
   var elements = document.getElementsByClassName('zm-item-comment');
   var n = elements.length;
   for (var i = 0; i < n; i++) {
   var e = elements[i];
   if (e.getElementsByClassName('zm-comment-hd')[0].innerHTML.search(muteword) > -1) {
   e.style.display = 'none';
   console.log(muteword)
   }
   }
*/


// 2. Timeline of homepage
function mute_current_item(feed_item, keywords) {
  var title = null;

  // upvote on answer
  var qtitles = feed_item.getElementsByClassName(Magic.timelineQlink);
  if (qtitles.length == 1) {
    title = qtitles[0].innerHTML;
  } else {
    // upvote on article
    var atitles = feed_item.getElementsByClassName("post-link");
    title = atitles[0].innerHTML;
  }

  for (var j = 0, len = keywords.length; j < len; j++) {
    var muteword = keywords[j];
    if (title.search(muteword) > -1) {
      hide(feed_item);
    }
  }
  return result;
}

function timeline_item_mute(keywords) {
  var elements = document.querySelectorAll(Magic.timelineFoldItem);
  n = elements.length;
  for (var i = 0; i < n; i++) {
    var feed_item = elements[i];
    try {
      var result = mute_current_item(feed_item, keywords);
    }
    catch (err) {
      // log('Not valid feed item: ' + err);
    }
  }
}

// Main function

// 0. Get current url to decide what to do
hrefValue = window.location.href;

// 1. Static methods that do not require listeners
// 1.1: People you may not want to know
var httpHome = "http://www.zhihu.com/";
var httpsHome = "https://www.zhihu.com/";
if (hrefValue == httpHome || hrefValue == httpsHome) {
  if (you_may_not_want_to_know == 1) {
    var column = document.getElementsByClassName('zh-trendings')[0];
    hide(column);
    log('No user suggestions anymore.');
  }
}

// 1.2: Personal info and site log on the top
// (hide for bigger -- hiths)
var not_zhuanlan = (hrefValue.search("zhuanlan.zhihu") < 0);
if (top_column_info_hidden == 1 && not_zhuanlan) {
  var logo = document.getElementsByClassName(Magic.topLeftLogo)[0];
  hide(logo);

  // logo is HTML collection, name is "object HTML collection"
  hide(document.getElementsByClassName(Magic.topRightName)[0]);

  log('Site logo and Your Personal Info on top column are hidden.');
  log('For the bigger -- @hiths.');
}

/* test
   document.getElementsByClassName('zu-top-link-logo')[0].style.display = 'none';
   document.getElementsByClassName('zu-top-nav-userinfo ')[0].style.display = 'none';
*/

// 2. Methods that are not always used
// 2.1 Question/Answer page
if (hrefValue.search('question') > -1) {

  // Relevent question suggestion column
  if (relevent_questions == 1) {
    var relevent = document.getElementsByClassName(Magic.releventQuestions);
    hide(relevent);
    log('No more suggestions on relevent questions.');
  }

  // Scroll listener to mute answers and comments
  if (document.addEventListener) {
    document.addEventListener(Magic.event, function (event) {
      comment_mute('zm-item-comment', mutelist);
      answer_mute('zm-item-answer', mutelist);
    }, false);
  }
}

// 2.2 Timeline
if (hrefValue.search('question') == -1) {
  if (document.addEventListener) {
    document.addEventListener(Magic.event, function (event) {
      timeline_item_mute(keywords);
    }, false);
  }
}
