function toReview(bid,cid,pid,vip) {
    const {
        java,
        source,chapter,book
    } = this;
  let r = "novelId="+bid+"&chapterId="+cid;
  let sre = "";
  let font_size = 12;
  let order = source.get("commentSort")!=""?source.get("commentSort"):0;
  let ptext = `<div class="tab-btn active">${chapter?"章评":"最新评论"}</div>
        <div class="tab-btn">长评</div>
        <div class="tab-btn">加精</div>`
   let currentUrl = `https://android.jjwxc.net/comment/getCommentList?versionCode=477&limit=50&offset=0&commentSort=${order}&${r}`;
   if(vip==1)currentUrl = `https://s8-static.jjwxc.net/comment_json.php?commentSort=${order}&chapterid=${cid}&novelid=${bid}&offset=0&limit=20`;
   
   if(typeof pid == "number"){
      let bookname = String(book.name).substring(0, 9);
      let booknamemd5 = java.md5Encode16(book.bookUrl);
      let chaptermd5 = java.md5Encode16(chapter.title);
      let path = `${book.getFolderName()}/${chapter.getFileName('nb')}`;
      ptext = java.importScript("/../files/book_cache/" + path);
     
      let list = String(ptext).split("\n");
      let pidp = 1;
      for(let p=0;p<list.length;p++){
          if(/^\s*◎/.test(list[0])&&p==0)continue
          if(/\u200E/.test(list[p]))continue;
          if(pidp==pid)ptext=list[p];
          pidp++;
      }
      let ytext = String(ptext).replace(/<img.*?>/g, '').replace(/[\s\S]+?作者有话说.*|\s/g,'');
      if (pid == -2) {
          ptext = String(ptext).split(/.*作者有话说.*/)[1].replace(/<img.*?>|\s/g, '').replace(/(.{48})[\s\S]*/,'$1......');
 
         } else {
             ptext = String(ptext).replace(/<img.*?>/g, '').replace(/(.{48})[\s\S]*/,'$1......').trim();
        }
            ptext = `<div class="p" style="font-size:12px;margin-top:2px;margin-left:12px;display:flex;align-items:center;background:#ffffff;overflow:auto;max-height:80px" onclick="
    const p1 = this.querySelector('.p1');
    const p2 = this.querySelector('.p2');
    
    if (p1.style.display !== 'none') {
        p1.style.display = 'none';
        p2.style.display = 'block';
        this.style.alignItems = 'flex-start'; 
    } else {
        p1.style.display = 'block';
        p2.style.display = 'none';
        this.style.alignItems = 'center'; 
    }
">
    <p class="p1" style="margin:0;padding:0;">
        <a style="color:#4a89dc;font-weight:bold;">原文：</a>${ptext}
    </p>
    <p class="p2" style="margin-top:3px;padding:0;display:none;">
        <a style="color:#4a89dc;font-weight:bold;">原文：</a>${ytext}
    </p>
</div>
`;
       currentUrl = `https://app.jjwxc.org/app.jjwxc/android/reading/comment/getCommentList?versionCode=477&paragraph_id=${pid}&offset=0&paragraph=1&limit=100&commentSort=${order}&${r},{"headers":{"versiontype":"reading","versionCode":"477"}}`
   }
   
 let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>:root {--primary-color: #5d9cec;--primary-light: #e6f0fa;--primary-dark: #4a89dc;--accent-color: #ff6b6b;--text-dark: #2d3748;--text-light: #718096;--text-lighter: #a0aec0;--bg-color: #f5f7fa;--card-bg: #ffffff;--border-color: #e8e8e8;--shadow-color: rgba(0,0,0,0.05);}* {margin: 0;padding: 0;box-sizing: border-box;}body {font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;background-color: var(--bg-color);color: var(--text-dark);line-height: 1.6;padding-top: 50px;padding-bottom: 60px;}/* 顶部标签栏 */.tab-bar {position: fixed;top: 0;left: 0;right: 0;background-color: var(--card-bg);display: flex;min-height: 50px;height:auto;border-bottom: 1px solid var(--border-color);z-index: 100;}.tab-btn {flex: 1;display: flex;align-items: center;justify-content: center;font-size: 16px;color: var(--text-light);position: relative;transition: all 0.3s;}.p{width:88%;font-weight:bold}.tab-btn.active {color: var(--primary-color);font-weight: 600;}.tab-btn.active::after {content: '';position: absolute;bottom: 0;left: 50%;transform: translateX(-50%);width: 40%;height: 3px;background-color: var(--primary-color);border-radius: 3px 3px 0 0;}/* 排序按钮区域 */.sort-container {padding: 10px 15px;margin:10px;background-color: var(--card-bg);display: flex;justify-content: flex-end;}.sort-dropdown {position: relative ;margin-top: 9px;margin-right:12px;display: inline-block;}.sort-btn {background: none;border: none;color: var(--text-light);font-size: 16px;padding: 5px 10px;}.sort-btn:hover {color: var(--primary-color);}.sort-dropdown-content {display: none;position: absolute;right: 5px;min-width: 160px;background-color: var(--card-bg);box-shadow: 0 8px 16px rgba(0,0,0,0.1);z-index: 1;border-radius: 4px;border: 1px solid var(--border-color);}.sort-dropdown-content a {color: var(--text-dark);padding: 12px 16px;text-decoration: none;display: block;font-size: 14px;}.sort-dropdown-content a:hover {background-color: var(--primary-light);}.sort-dropdown-content a i {margin-right: 8px;width: 16px;color: var(--primary-color);}.sort-dropdown:hover .sort-dropdown-content {display: block;}/* 评论区域 */.comments-container {padding: 0 15px;margin-top:55px}.comment-item:first-of-type{margin-top:20px}.comment-item {background-color: var(--card-bg);border-radius: 8px;padding: 15px;margin-bottom: 15px;box-shadow: 0 2px 8px var(--shadow-color);}.comment-header {display: flex;align-items: center;margin-bottom: 10px;}.username {font-weight: 600;font-size: 11px;color: var(--primary-dark);margin-right: 10px;}.user-badges {display: flex;}.badge {font-size: 10px;padding: 0px 5px;border-radius: 4px;margin-right: 8px;font-weight: 500;}.badge.primary {background-color: var(--primary-light);color: var(--primary-dark);}.badge.accent {background-color: #fff0f0;color: var(--accent-color);}.badge.gold {background-color: #fff8e6;color: #ffa502; }.comment-info {display: flex;justify-content: space-between; /* 两端对齐 */}.comment-meta {font-size: 10px;color: var(--text-light);margin-top: 5px;}.comment-content {font-size: ${font_size}px;line-height: 1.6;color: var(--text-dark);margin-bottom: 10px;}.comment-actions {display: flex;justify-content: flex-end;}.action-btn {display: flex;align-items: center;margin-left: 20px;font-size: 10px;color: var(--text-light);transition: all 0.2s;}.action-btn:hover {color: var(--primary-color);}.action-btn i {margin-right: 5px;}/* 回复区域 */.replies-section {margin-top: 15px;padding-left: 15px;border-left: 2px solid var(--primary-light);}.author-rep{border-left: 2px solid var(--primary-dark);}.reply-item {padding: 12px 0;border-bottom: 1px dashed var(--border-color);}.reply-add.hide{display:none}.reply-item:last-of-type {border-bottom: none;}.reply-header {display: flex;align-items: center;margin-bottom: 5px;}.reply-label {background-color: var(--primary-color);color: white;font-size: 10px;padding: 0px 5px;border-radius: 3px;margin-right: 8px;font-weight: 500;}.load-more-replies,.close-more-replies {font-size: 12px;color: var(--primary-color);text-align: center;padding: 10px 0;font-weight: 500;}.close-more-replies.hide,.load-more-replies.hide{display:none}/* 悬浮评论按钮 */.floating-btn {position: fixed;bottom: 30px;right: 15px;width: 30px;height: 60px;display: flex;align-items: center;justify-content: center;flex-direction: column;font-size: 20px;z-index: 100;}#top,#down{opacity:0.4}#top:hover,#down:hover{opacity:1}.gold img{height:12px;}.cp{text-indent:2em;margin-bottom:1em;text-align:justify;max-width: 100%;overflow-wrap: break-word;word-break: break-word;hyphens: auto;}.ef{width: 24px; display: inline-block; vertical-align: middle; margin-top: -4px;}.author-announcement>*:not(.comment-header){display:none}
.cp a{color:#6CAB8D;text-decoration: none;}</style>
</head>

<body>
    <!-- 顶部标签栏 -->
    <div class="tab-bar">
            ${ptext}
        <div class="sort-dropdown" style="${!chapter?"display:none":""}">
            <button class="sort-btn"><i class="fas fa-sort"></i></button>
            <div class="sort-dropdown-content">
                <a href="#"><i class="fas${order==1?' fa-check':''}"></i>按回复时间正序</a>
                <a href="#"><i class="fas${order==0?' fa-check':''}"></i>按回复时间倒序</a>
                <a href="#"><i class="fas${order==2?' fa-check':''}"></i>按点赞数量排序</a>
            </div>
        </div>
    </div>
    
    <!-- 评论区域 -->
    <div style="box-shadow: 0 2px 8px rgba(0,0,0,0.1);position: fixed;top:50px;left:0;right:0;width:100%;font-size:10px;padding:5px;background:#e6f0fa;color:#4a89dc;border-radius:0px 0px 20px 20px;text-align:center"><span  class="commentTotal">共0条评论 </span> <span class="page">已显示0条</span> <span class="nopage">屏蔽0条</span></div>
    <div class="comments-container">
            <div style="text-align: center;
        padding: 10px;
        color: #666;
        font-size: 14px;" class="loading">加载中......</div>
    </div>
    
    <!-- 悬浮按钮 -->
    <div class="floating-btn">
        <div id="top"><i class="fa fa-arrow-circle-up"></i></div>
        <div id="down"><i class="fa fa-arrow-circle-down"></i></div>
    </div>
    
</body>
</html>
`;

let script = `setTimeout(function() {   // 切换按钮功能
    let order = 0;
    
    let base = "https://android.jjwxc.net/comment/getCommentList";
    let currentUrl = \`${currentUrl}\`;
    let commentTotal = 0;
    let nocommentTotal = 0;
    let isLoading = false;
    let page = 1;
    let hasMore = true;
    var pageTotal = 1;
    let wrongi = 3;
    loadUrl();
    openTop();
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
                let n = this.textContent;
                document.querySelectorAll('.tab-btn').forEach(x=>{
                    x.classList.remove('active');
                });
                if(n!="章评")document.querySelector(".sort-dropdown").style.display="none";
                if(n=="章评")document.querySelector(".sort-dropdown").style.display="block";
                commentTotal = 0;
                if(/长评/.test(n)){
                    currentUrl = \`https://android.jjwxc.net/comment/getLongCommentList,{"method":"POST","body":"versionCode=477&limit=100&offset=0&${r}"}\`
                }else if(/加精/.test(n)){
                    currentUrl = \`$\{base},{"method":"POST","body":"versionCode=477&limit=100&authorLike=1&offset=0&${r}"}\`
                }else{
                    currentUrl = \`$\{base}?versionCode=477&limit=50&offset=0&commentSort=$\{order}&${r}\`;
                    if("${vip}"=="1")currentUrl = \`https://s8-static.jjwxc.net/comment_json.php?commentSort=${order}&chapterid=${cid}&novelid=${bid}\`;
                }
                
                
                commentTotal = 0;
                nocommentTotal = 0;
                loadUrl();
                openTop();
                this.classList.add('active');
            });
     });
     
function openTop(){
                
let accent = document.querySelector('.accent');
        if(accent){
            document.querySelectorAll('.accent').forEach((x,i)=>{
                x.addEventListener('click', function(e) {
                    let name = this.textContent;
                    this.textContent = name == "收起"?"展开":"收起";
                    document.querySelectorAll('.author-announcement:nth-of-type('+(i+1)+')>*:not(.comment-header)')
                    .forEach(element => {
                        element.style.display = name=="收起"?'none':"block"
                       });
                      });
                     })
        }
}
     
        function loadUrl(){
                let JsonData = getJson(currentUrl);
                let html = createCommentHtml(JsonData);
                
                document.querySelector('.comments-container').innerHTML = html;
                window.scrollTo(0, 0);
                let loader = document.querySelector(".loading-more");
                wrongi--;
                if(loader && wrongi>0){
                     java.longToast("正在重试倒数第"+wrongi+"次....")
                    loadUrl();
                    loader.onclick = () => {
                        java.longToast("正在重试....")
                        loader.textContent = "加载中....";
                        loadUrl();
                     };
                }else{
                    wrongi = 3;
                
                }
                openReply();
        }
        
        const sortDropdown = document.querySelector('.sort-dropdown');
     const sortBtn = document.querySelector('.sort-btn');
     sortBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const content = document.querySelector('.sort-dropdown-content');
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });
        
        document.addEventListener('click', function() {
            document.querySelector('.sort-dropdown-content').style.display = 'none';
        });
        
        document.querySelector('.sort-dropdown-content').addEventListener('click', function(e) {
            e.stopPropagation();
        });
        document.querySelectorAll('.sort-dropdown-content a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelectorAll('.sort-dropdown-content i').forEach(b => {
                    b.classList.remove('fa-check');
                 });
                this.querySelector("i").className = 'fas fa-check';
                // 模拟排序操作
                let sort = this.textContent.trim();
                commentTotal = 0;
                if(/倒序/.test(sort)){
                    order = 0
                }else if(/正序/.test(sort)){
                    order = 1;
                }else{
                    order = 2;
                }
                source.put("commentSort",order)
                currentUrl = currentUrl.replace(/offset=\\d+/,'offset=0').replace(/commentSort=\\d+/,'commentSort='+order);
                
                loadUrl();
                openTop();
                java.longToast("切换至："+sort)
                document.querySelector('.sort-dropdown-content').style.display = 'none';
            });
        });
        
function openReply(){
        document.querySelectorAll('.load-more-replies,.close-more-replies').forEach(btn => {
            btn.addEventListener('click', function(e) {
                   let className = this.className;
                   if(/load-more-replies/.test(className)){
                         const repliesSection = e.target.parentNode;
                         let content = this.textContent;
                         let totalnum = Number(content.match(/共(\\d+)/)[1]);
                         let dataid = this.dataset.id;
                         let datanum = Number(this.dataset.num);
                         if(datanum<totalnum){
                             let url = \`https://android.jjwxc.net/comment/getReplyList,{"method":"POST","body":"versionCode=477&commentId=$\{dataid}&offset=$\{datanum}&limit=20&isBackend=2&${r}"}\`;
                             this.insertAdjacentHTML('beforebegin', createHtml(getReplyJson(url),"reply",1));
                             this.dataset.num = datanum+20;
                             let synum = Number(content.match(/还剩(\\d+)/)[1])-20;
                             if(synum>0){
                                 this.textContent = content.replace(/还剩\\d+/,'还剩'+synum)
                              }else{
                                  e.target.nextElementSibling.classList.remove("hide");
                                  this.classList.add("hide");
                               }
                         }else{
                             document.querySelectorAll('.reply-add').forEach(x=>{
                                 x.classList.remove("hide")
                              });
                              e.target.nextElementSibling.classList.remove("hide");
                              this.classList.add("hide");
                         }
                         
                         
                   }else if(/close-more/.test(className)){
                       //收起回复
                       this.classList.add("hide")
                       e.target.previousElementSibling .classList.remove("hide");
                       document.querySelectorAll('.reply-add').forEach(x=>{
                           x.classList.add("hide")
                       })
                   }
            });
        });
     }
     
${replaceEmoticons.toString()}
${formatChineseText.toString()}

function passText(text){
      let sre = \`${sre}\`;
      let zi = String.raw\`|为营造更好的评论环境|(?:^\\[[^\\]]+?\\]\\s*(?:嗑到了|kswl)\\s*$)\`;
      sre = sre?sre+zi:zi.replace(/^\\|/,'');
      sre = sre ? new RegExp(sre.replace(/#|＃/g, '|')) : false;
      return sre?sre.test(text):false
}



function getJson(url){
    try{
    let limit = Number(url.match(/limit=(\\d+)/)?.[1]??0);
    
    let data = String( java.ajax(url));
    
    let JsonData = JSON.parse(data || "{}");
    data = JsonData?.data ?? JsonData?.body ?? {};
    let r = {};
    let cTotal = Number(data?.commentTotal??20);
    pageTotal = Math.ceil(cTotal/limit);
    r.commentTotal = cTotal;
    let commentList = [];
    if(data.commentList===undefined &&JsonData.body===undefined){
        
        return JsonData?.message?JsonData.message:false;
    }
    
    let clist = data?.commentList ?? data;
    
    for(let i=0;i<clist.length;i++){
        let x = clist[i];
        
        let comment = {};
        let passtext = /营养液|地雷|手榴弹|火箭炮|浅水炸弹|霸王票|深水鱼雷|kswl|嗑到了/;
        if((x.isdel==22 && passtext.test(x.commentBody??x.commentbody) ) || passText(x.commentBody??x.commentbody)){
            nocommentTotal++
            continue;
        }
       
        let chaptername = ${!chapter?1:"''"}==1?"第"+x.chapterId+"章":"";
       let vip = x.is_vip_chapter?"💰":"";
       chaptername = vip+chaptername+"•";
        comment.meta =(${!chapter?1:"''"}==1?chaptername:"")+ (x.commentMark??x.commentmark)+"分•"+(x.commentDate??x.reply_date)+"•"+x.ip_pos;
        comment.content = (x.commentBody??x.commentbody??"").replace(/href=.*?novelDetail.*?novelid":"(\\d+)".*?>/g,function(m,r){
                href = \` legado://import/addToBookshelf?src=$\{encodeURIComponent('http://app-cdn.jjwxc.net/androidapi/novelbasicinfo?novelId='+r)}\`;
                
                 return 'href="'+href+'">';
                });
                
        comment.username = x.commentAuthor??x.commentauthor;
        comment.disagreenum = x.disagreenum;
        comment.agreenum = x.agreenum;
        let top = x.bulletinComment==1?"公告":((x.is_top==1||x.is_king_top==1||x.is_reader_top==1||x.is_admin_top==1)?"置顶":"");
        if(top)comment.top = top;
        comment.isAuthor = x.isAuthor;
        comment.icon = x.subscriptionicon;
        
        comment.rate = x.subscriptionrate || ((x.subscriptionicon??"").match(/<.*>/)?.[0]??"");
        
        comment.replyNum = x.replyTotal ?? x.reply_total??0;
        
        comment.id = x.commentId??x.commentid;
        comment.author_agree= x.author_agree;
        comment.belike = x.beLike??x.belike;
        comment.cid = x.chapterId;
        comment.vip = x.is_vip_chapter==1?"💰":"";
        if(comment.replyNum>0){
            comment.list = (x.replyAll??x.reply)?getReplyJson(x.replyAll??x.reply):[]
        }
        commentList.push(comment)
    }
    
    commentTotal += commentList.length;
    if(commentList[0]?.top=="公告"&&page>1)commentTotal--;
    document.querySelector(".page").textContent = "已显示"+commentTotal+"条";
    document.querySelector(".nopage").textContent = "屏蔽"+nocommentTotal+"条";
    r.list = commentList;
    return r
    }catch(e){
        
         return false
    }
}
  
 function getReplyJson(data){
     try{
      if(/^http/.test(data)){
          data = java.ajax(data);
          data = JSON.parse(data || "{}")?.data ?? [];
      }
       let replyList = [];
      for(i in data){
                let x = data[i];
                let reply = {};
                if(passText(x.replyBody))continue;
                reply.meta = x.floor+"楼•"+(x.replyDate??x.commentdate)+"•"+x.ip_pos;
                reply.content = x.replyBody??x.commentbody;
                reply.username = x.replyAuthor??x.commentauthor;
                reply.disagreenum = x.disagreenum;
                reply.agreenum = x.agreenum;
                reply.isAuthor = x.isAuthor;
                reply.icon = x.subscriptionicon;
                reply.rate = x.subscriptionrate || (x.subscriptionicon.match(/<.*>/)?.[0]??"");
                replyList.push(reply)
       };
       return replyList
       }catch(e){
           java.log(e)
           return []
       }
  }

 function createCommentHtml(JsonData){
     if(JsonData && typeof JsonData!=="string"){
    document.querySelector(".commentTotal").textContent = "共"+JsonData.commentTotal+"条评论"
    if(page>=2)html = "";
    html=createHtml(JsonData.list,"comment");
    return html;
    }else{
        const loader = document.createElement('div');
        loader.className = 'loading-more';
        loader.style.cssText = \`
        text-align: center;
        padding: 10px;
        color: #666;
        font-size: 14px;
    \`;
    loader.textContent = typeof JsonData==="string"?JsonData:"加载失败，点击重试"
    loader.style.color = '#f00';
    return loader.outerHTML
    }
}

function createHtml(JsonData,t,type){
    let html = "";
    for(i in JsonData){
        let x = JsonData[i];
        if(page>=2&&x.top)continue;
        let replyHtml = "";
        if(x.list && x.list.length>0){
            let openReply ="";
           if(x.replyNum>5){
               openReply = \` <div class="load-more-replies" data-id="$\{x.id}" data-num="5">
                    <i class="fa fa-angle-double-down"></i> 共$\{x.replyNum}条回复
                还剩$\{x.replyNum-5}条回复</div>
                <div class="close-more-replies hide">
                    <i class="fa fa-angle-double-up"></i> 收起回复
                </div>\`
           }
            
            replyHtml = \`<div class="replies-section">
                $\{createHtml(x.list,"reply")}
                $\{openReply}
            </div>\`
        }
        let user_badges = "";
        if(x.top){
            user_badges = \`<div class="user-badges">
                    <div class="badge primary">$\{x.top}</div>
                    <div class="badge accent">展开</div>
                </div>\`
        }else if(x.icon || x.rate){
              user_badges = \`<div class="user-badges">
                    <div class="badge gold">
                          $\{x.rate.replace(/src=\\/\\//g,'src=https://').replace(/style='.*?'/,'style="display:inline-block;margin-top:3px"')||"100%"}
                    </div>
                </div>\`
        }
        let info = "";
        if(x.agreenum>=0){
            info = \`<div class="comment-info">
                        <div class="comment-meta">$\{(x.meta??"").replace(/•$/,'')}</div>
                        <div class="comment-actions">
                            <div class="action-btn"><i class="far fa-thumbs-up"></i> $\{x.agreenum}</div>
                            <div class="action-btn"><i class="far fa-thumbs-down"></i> $\{x.disagreenum}</div> 
                       </div>
                    </div>\`
        }
        let author_agree="";
        if(x.author_agree==1 || x.belike==1){
             author_agree =\`<div class="like" style="flex:1;text-align:right"><div class="badge" style="background:#E9F3EE;color:#6CAB8D;display:inline-block;">$\{x.belike==1?"精":"作者点赞"}</div></div>\`
        }
        html+=\`<div class="$\{t}-item$\{type?' reply-add':''}$\{x.top?' author-announcement':''}">
                    <div class="$\{t}-header">
                         <div class="username">$\{x.username}</div>
                        $\{x.isAuthor==1?'<div class="reply-label">作者</div>':''}
                        $\{user_badges}
                        $\{author_agree}
                    </div>
                    <div class="comment-content">$\{formatChineseText(replaceEmoticons(x.content))}</div>
                    $\{info}
                    $\{replyHtml}
                </div>\`
    };
    if(t=="comment"){
        if(html==""){
            html = \`    <div style="text-align: center;
        padding: 10px;
        color: #666;
        font-size: 14px;">暂无评论</div>\`
        }
    }
    return html
}
  
function checkScrollBottom() {
    if (isLoading || !hasMore) return;
    const lastComment = document.querySelector('.comment-item:last-of-type');
    if (!lastComment) return;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (documentHeight - (scrollTop + windowHeight) < 100) {
        loadNextPage();
    }
}

function loadNextPage() {
    if (isLoading || !hasMore) return;
    page++;
    if (page > pageTotal) { 
                hasMore = false;
                const noMore = document.createElement('div');
                noMore.className = 'no-more';
                noMore.textContent = '没有更多评论了';
                noMore.style.cssText = \`
                    text-align: center;
                    padding: 10px;
                    color: #999;
                    font-size: 14px;
                \`;
                document.querySelector('.comments-container')?.appendChild(noMore);
                return;
    }
    
    isLoading = true;
    const loader = document.createElement('div');
    loader.className = 'loading-more';
    loader.textContent = '加载 第'+page+'页 中...';
    loader.style.cssText = \`
        text-align: center;
        padding: 10px;
        color: #666;
        font-size: 14px;
    \`;
    
    const container = document.querySelector('.comments-container') || document.body;
    container.appendChild(loader);
    setTimeout(() => {
        fetchMoreComments()
            .then(() => {
                container.removeChild(loader);
                isLoading = false;
            })
            .catch(() => {
                loader.textContent = '加载失败，点击重试';
                loader.style.color = '#f00';
                loader.onclick = () => {
                    container.removeChild(loader);
                    isLoading = false;
                    page--;
                    loadUrl();
                };
            });
    }, 100);
}

function fetchMoreComments() {
    return new Promise((resolve) => {
        setTimeout(() => {
            let offset = Number(currentUrl.match(/offset=(\\d+)/)[1]);
            let limit = Number(currentUrl.match(/limit=(\\d+)/)[1]);
            offset = offset+limit;
            currentUrl = currentUrl.replace(/offset=\\d+/,"offset="+offset);
            var htmlString = createCommentHtml(getJson(currentUrl));
            const container = document.querySelector('.comments-container') || document.body;
            const loader = container.querySelector('.loading-more');
            if (loader) {
                loader.insertAdjacentHTML('beforebegin', htmlString);
             } else {
                 container.insertAdjacentHTML('beforeend', htmlString);
             }
             openReply()
            resolve();
        }, 1000);
    });
}

let scrollTimer;
window.addEventListener('scroll', function() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(checkScrollBottom, 100);
});

const topBtn = document.querySelector('#top');
topBtn.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' 
    });
});

const bottomBtn = document.querySelector('#down');
bottomBtn.addEventListener('click', function() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
});
},200)`;

   java.showBrowser("",html,script,`{
		expandedCornersRadius:10,
		heightPercentage:0.72
		}`)
}