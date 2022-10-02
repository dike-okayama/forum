
function newPost() {
    var content = document.getElementById("content").value;
    console.log("投稿内容: " + content);
    $.ajax({
        type: "GET",
        url: "/newpost/",
        data: { content: content },
    }).done(function (data) {
        if (data.test) {
            console.log(data.test);
        } else {
            $("#posts").html(data.html);
            $("#wordcloud").html(data.wordcloud);
            $("#first-card").css("background-color", "white").slideDown(200);
            clearTextarea();
            document.activeElement.blur();
            // タイピングアニメーション
            var element = $(".TextTyping");
            element.each(function () {
                var text = $(this).html();
                var textbox = "";
                text.split("").forEach(function (t) {
                    if (t !== " ") {
                        textbox += "<span>" + t + "</span>";
                    } else {
                        textbox += t;
                    }
                });
                $(this).html(textbox);
            });
            TextTypingAnime();
            // ここまで
            $("#first-card")
                .delay($("#first-content span").length * 100)
                .queue(function () {
                    $("#first-card").css("background-color", data.color);
                    $("#first-content").html(data.animation);
                    $(this).find(".border-animation").addClass("active");
                });
        }
    });
}

function clearTextarea() {
    var textareaForm = document.getElementById("content");
    textareaForm.value = "";
    $("#content").css("height", 40);
}

function delPost(post_id) {
    $("#post" + post_id).slideUp(200);
    $.ajax({
        type: "POST",
        url: "/delpost/" + post_id + "/",
        data: {},
    });
}

function sortPosts() {
    if (document.getElementById("c_rb1").checked) {
        method = "emotion-asc";
    } else if (document.getElementById("c_rb2").checked) {
        method = "emotion-desc";
    } else if (document.getElementById("c_rb3").checked) {
        method = "date-asc";
    } else {
        method = "date-desc";
    }
    $.ajax({
        type: "GET",
        url: "/sort_post/",
        data: { method: method },
    }).done(function (data) {
        $("#posts").html(data.data);
        window.scrollTo(0, 0);
    });
}

// ページトップリンクのための関数
// https://coco-factory.jp/ugokuweb/move01/8-1-8/

//スクロールした際の動きを関数でまとめる
function PageTopAnime() {
    var scroll = $(window).scrollTop();
    if (scroll >= 100) {
        //上から100pxスクロールしたら
        $("#page-top").removeClass("DownMove"); //#page-topについているDownMoveというクラス名を除く
        $("#page-top").addClass("UpMove"); //#page-topについているUpMoveというクラス名を付与
    } else {
        if ($("#page-top").hasClass("UpMove")) {
            //すでに#page-topにUpMoveというクラス名がついていたら
            $("#page-top").removeClass("UpMove"); //UpMoveというクラス名を除き
            $("#page-top").addClass("DownMove"); //DownMoveというクラス名を#page-topに付与
        }
    }
}

// 画面をスクロールをしたら動かしたい場合の記述
$(window).scroll(function () {
    PageTopAnime(); /* スクロールした際の動きの関数を呼ぶ*/
});

// ページが読み込まれたらすぐに動かしたい場合の記述
$(window).on("load", function () {
    PageTopAnime(); /* スクロールした際の動きの関数を呼ぶ*/
    color = $("#first-card").css("background-color");
    $("#first-card").css("background-color", "white").slideDown(100);
    //spanタグを追加する
    var element = $(".TextTyping");
    element.each(function () {
        var text = $(this).html();
        var textbox = "";
        text.split("").forEach(function (t) {
            if (t !== " ") {
                textbox += "<span>" + t + "</span>";
            } else {
                textbox += t;
            }
        });
        $(this).html(textbox);
    });
    TextTypingAnime();
    $("#first-card")
        .delay($("#first-content span").length * 100)
        .queue(function () {
            $("#first-card").css("background-color", color);
            $("#first-content").html(
                document
                    .getElementById("decorated-post")
                    .innerHTML.replaceAll("&lt;", "<")
                    .replaceAll("&gt;", ">")
            );
            $(this).find(".border-animation").addClass("active");
        });
});

// #page-topをクリックした際の設定
$("#page-top").click(function () {
    var scroll = $(window).scrollTop(); //スクロール値を取得
    if (scroll > 0) {
        $(this).addClass("floatAnime"); //クリックしたらfloatAnimeというクラス名が付与
        $("body,html").animate(
            {
                scrollTop: 0,
            },
            2000,
            function () {
                //スクロールの速さ。数字が大きくなるほど遅くなる
                $("#page-top").removeClass("floatAnime"); //上までスクロールしたらfloatAnimeというクラス名を除く
            }
        );
    }
    return false; //リンク自体の無効化
});

// ============
// タイピング風に文字が出現する
// https://coco-factory.jp/ugokuweb/move02/8-10/
// TextTypingというクラス名がついている子要素（span）を表示から非表示にする定義
function TextTypingAnime() {
    $(".TextTyping").each(function () {
        var elemPos = $(this).offset().top - 50;
        var scroll = $(window).scrollTop();
        var windowHeight = $(window).height();
        var thisChild = "";
        if (scroll >= elemPos - windowHeight) {
            thisChild = $(this).children(); //spanタグを取得
            //spanタグの要素の１つ１つ処理を追加
            thisChild.each(function (i) {
                var time = 100;
                //時差で表示する為にdelayを指定しその時間後にfadeInで表示させる
                $(this)
                    .delay(time * i)
                    .fadeIn(time);
            });
        } else {
            thisChild = $(this).children();
            thisChild.each(function () {
                $(this).stop(); //delay処理を止める
                $(this).css("display", "none"); //spanタグ非表示
            });
        }
    });
}

//textareaの要素を取得
let textarea = document.getElementById("content");
//textareaのデフォルトの要素の高さを取得
let clientHeight = textarea.clientHeight;

//textareaのinputイベント
textarea.addEventListener("input", () => {
    //textareaの要素の高さを設定（rows属性で行を指定するなら「px」ではなく「auto」で良いかも！）
    textarea.style.height = clientHeight + "px";
    //textareaの入力内容の高さを取得
    let scrollHeight = textarea.scrollHeight;
    //textareaの高さに入力内容の高さを設定
    textarea.style.height = scrollHeight + "px";
});

$(textarea).focus(function () {
    $("#post-hr")
        .animate({ width: "91%", left: "4.5%", height: 2 }, "fast")
        .css("color", "blue");
});

$(textarea).blur(function () {
    $("#post-hr")
        .css("color", "gray")
        .animate({ width: "90%", left: "5%", height: 1 });
});

$(".card").click(function () {
    $(this).find(".border-animation").addClass("active");
});

// ログイン用のモーダルウィンドウ

$(function () {
    // 変数に要素を入れる
    var open = $(".modal-open"),
        close = $(".modal-close"),
        container = $(".modal-container");

    //開くボタンをクリックしたらモーダルを表示する
    open.on("click", function () {
        container.addClass("active");
        return false;
    });

    //閉じるボタンをクリックしたらモーダルを閉じる
    close.on("click", function () {
        container.removeClass("active");
    });

    //モーダルの外側をクリックしたらモーダルを閉じる
    $(document).on("click", function (e) {
        if (!$(e.target).closest(".modal-body").length) {
            container.removeClass("active");
        }
    });
});
