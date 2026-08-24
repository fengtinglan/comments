// script.js
(function() {
    function init() {
        // ========== 读取本地页面提供的参数 ==========
        const params = window.__JJWXC_PARAMS__ || {};
        const bid = params.bid || '';
        const cid = params.cid || '';
        const pidParam = params.pid;
        const vip = params.vip || '0';
        const isPara = pidParam !== null && pidParam !== undefined && !isNaN(Number(pidParam));
        const pid = isPara ? Number(pidParam) : null;

        // ========== 主题初始化 ==========
        const savedTheme = localStorage.getItem('jjwxc_theme') || 'default';
        document.body.className = 'theme-' + savedTheme;

        // ========== 排序初始化 ==========
        let order = parseInt(params.order || localStorage.getItem('commentSort') || '0');
        localStorage.setItem('commentSort', order);

        // ========== 全局变量 ==========
        let currentUrl = '';
        let commentTotal = 0;
        let nocommentTotal = 0;
        let isLoading = false;
        let page = 1;
        let hasMore = true;
        let pageTotal = 1;
        let wrongi = 3;
        const baseCommentUrl = 'https://android.jjwxc.net/comment/getCommentList';
        const baseReplyUrl = 'https://android.jjwxc.net/comment/getReplyList';
        const baseQuery = `novelId=${bid}&chapterId=${cid}`;

        // ========== 构建顶部栏 ==========
        function buildTabBar() {
            const tabBar = document.getElementById('tabBar');
            if (isPara) {
                // 段评模式：显示原文预览 + 排序按钮
                const ptext = java.get('ptext') || '';
                const ytext = java.get('ytext') || '';
                tabBar.innerHTML = `
                    <div class="p" style="font-size:12px;margin-top:2px;margin-left:12px;display:flex;align-items:center;background:var(--card-bg);overflow:auto;max-height:80px" onclick="toggleParaText(this)">
                        <p class="p1" style="margin:0;padding:0;">
                            <a style="color:var(--primary-dark);font-weight:bold;">原文：</a>${ptext}
                        </p>
                        <p class="p2" style="margin-top:3px;padding:0;display:none;">
                            <a style="color:var(--primary-dark);font-weight:bold;">原文：</a>${ytext}
                        </p>
                    </div>
                    <div class="sort-dropdown" id="sortDropdown">
                        <button class="sort-btn"><i class="fas fa-sort"></i></button>
                        <div class="sort-dropdown-content" id="sortContent">
                            <a href="#" data-order="1"><i class="fas fa-check"></i>按回复时间正序</a>
                            <a href="#" data-order="0"><i class="fas fa-check"></i>按回复时间倒序</a>
                            <a href="#" data-order="2"><i class="fas fa-check"></i>按点赞数量排序</a>
                        </div>
                    </div>
                `;
                // 设置当前排序勾选
                document.querySelectorAll('#sortContent a').forEach(a => {
                    if (Number(a.dataset.order) === order) {
                        a.querySelector('i').className = 'fas fa-check';
                    } else {
                        a.querySelector('i').className = 'fas';
                    }
                });
                // 段评接口
                currentUrl = `https://app.jjwxc.org/app.jjwxc/android/reading/comment/getCommentList?versionCode=477&paragraph_id=${pid}&offset=0&paragraph=1&limit=100&commentSort=${order}&${baseQuery},{"headers":{"versiontype":"reading","versionCode":"477"}}`;
            } else {
                // 非段评：章评/长评/加精三个 tab
                tabBar.innerHTML = `
                    <div class="tab-btn active" data-type="comment">章评</div>
                    <div class="tab-btn" data-type="long">长评</div>
                    <div class="tab-btn" data-type="featured">加精</div>
                    <div class="sort-dropdown" id="sortDropdown">
                        <button class="sort-btn"><i class="fas fa-sort"></i></button>
                        <div class="sort-dropdown-content" id="sortContent">
                            <a href="#" data-order="1"><i class="fas fa-check"></i>按回复时间正序</a>
                            <a href="#" data-order="0"><i class="fas fa-check"></i>按回复时间倒序</a>
                            <a href="#" data-order="2"><i class="fas fa-check"></i>按点赞数量排序</a>
                        </div>
                    </div>
                `;
                // 设置排序勾选
                document.querySelectorAll('#sortContent a').forEach(a => {
                    if (Number(a.dataset.order) === order) {
                        a.querySelector('i').className = 'fas fa-check';
                    } else {
                        a.querySelector('i').className = 'fas';
                    }
                });
                // 默认章评接口
                currentUrl = `${baseCommentUrl}?versionCode=477&limit=50&offset=0&commentSort=${order}&${baseQuery}`;
                if (vip == '1') {
                    currentUrl = `https://s8-static.jjwxc.net/comment_json.php?commentSort=${order}&chapterid=${cid}&novelid=${bid}&offset=0&limit=20`;
                }
            }
        }

        // 原文展开/收起
        window.toggleParaText = function(el) {
            const p1 = el.querySelector('.p1');
            const p2 = el.querySelector('.p2');
            if (p1.style.display !== 'none') {
                p1.style.display = 'none';
                p2.style.display = 'block';
                el.style.alignItems = 'flex-start';
            } else {
                p1.style.display = 'block';
                p2.style.display = 'none';
                el.style.alignItems = 'center';
            }
        };

        // ========== 工具函数 ==========
        function replaceEmoticons(text) {
            // 简单替换：将表情代码替换为占位，可根据需要扩展
            return text || '';
        }

        function formatChineseText(text) {
            // 简单格式化：保留原样
            return text || '';
        }

        function passText(text) {
            const sre = '';
            let zi = String.raw`|为营造更好的评论环境|(?:^\[[^\]]+?\]\s*(?:嗑到了|kswl)\s*$)`;
            let regStr = sre ? sre + zi : zi.replace(/^\|/, '');
            const regex = regStr ? new RegExp(regStr.replace(/#|＃/g, '|')) : false;
            return regex ? regex.test(text) : false;
        }

        function getJson(url) {
            try {
                const limitMatch = url.match(/limit=(\d+)/);
                const limit = limitMatch ? Number(limitMatch[1]) : 20;
                const dataStr = String(java.ajax(url));
                const JsonData = JSON.parse(dataStr || '{}');
                const data = JsonData?.data ?? JsonData?.body ?? {};
                let r = {};
                let cTotal = Number(data?.commentTotal ?? 20);
                pageTotal = Math.ceil(cTotal / limit);
                r.commentTotal = cTotal;
                let commentList = [];

                if (data.commentList === undefined && JsonData.body === undefined) {
                    return JsonData?.message ? JsonData.message : false;
                }

                const clist = data?.commentList ?? data;
                for (let i = 0; i < clist.length; i++) {
                    const x = clist[i];
                    const passtext = /营养液|地雷|手榴弹|火箭炮|浅水炸弹|霸王票|深水鱼雷|kswl|嗑到了/;
                    if ((x.isdel == 22 && passtext.test(x.commentBody ?? x.commentbody)) || passText(x.commentBody ?? x.commentbody)) {
                        nocommentTotal++;
                        continue;
                    }

                    let chaptername = isPara ? '' : (vip == '1' ? '💰' : '') + '•';
                    let comment = {};
                    comment.meta = chaptername + (x.commentMark ?? x.commentmark) + '分•' + (x.commentDate ?? x.reply_date) + '•' + x.ip_pos;
                    comment.content = (x.commentBody ?? x.commentbody ?? '').replace(/href=.*?novelDetail.*?novelid":"(\d+)".*?>/g, function(m, r) {
                        const href = ` legado://import/addToBookshelf?src=${encodeURIComponent('http://app-cdn.jjwxc.net/androidapi/novelbasicinfo?novelId=' + r)}`;
                        return 'href="' + href + '">';
                    });
                    comment.username = x.commentAuthor ?? x.commentauthor;
                    comment.disagreenum = x.disagreenum;
                    comment.agreenum = x.agreenum;
                    let top = x.bulletinComment == 1 ? '公告' : ((x.is_top == 1 || x.is_king_top == 1 || x.is_reader_top == 1 || x.is_admin_top == 1) ? '置顶' : '');
                    if (top) comment.top = top;
                    comment.isAuthor = x.isAuthor;
                    comment.icon = x.subscriptionicon;
                    comment.rate = x.subscriptionrate || ((x.subscriptionicon ?? '').match(/<.*>/)?.[0] ?? '');
                    comment.replyNum = x.replyTotal ?? x.reply_total ?? 0;
                    comment.id = x.commentId ?? x.commentid;
                    comment.author_agree = x.author_agree;
                    comment.belike = x.beLike ?? x.belike;
                    comment.cid = x.chapterId;
                    comment.vip = x.is_vip_chapter == 1 ? '💰' : '';
                    if (comment.replyNum > 0) {
                        comment.list = (x.replyAll ?? x.reply) ? getReplyJson(x.replyAll ?? x.reply) : [];
                    }
                    commentList.push(comment);
                }

                commentTotal += commentList.length;
                if (commentList[0]?.top == '公告' && page > 1) commentTotal--;
                document.querySelector('.page').textContent = '已显示' + commentTotal + '条';
                document.querySelector('.nopage').textContent = '屏蔽' + nocommentTotal + '条';
                r.list = commentList;
                return r;
            } catch (e) {
                return false;
            }
        }

        function getReplyJson(data) {
            try {
                if (/^http/.test(data)) {
                    data = java.ajax(data);
                    data = JSON.parse(data || '{}')?.data ?? [];
                }
                let replyList = [];
                for (let i in data) {
                    const x = data[i];
                    if (passText(x.replyBody)) continue;
                    let reply = {};
                    reply.meta = x.floor + '楼•' + (x.replyDate ?? x.commentdate) + '•' + x.ip_pos;
                    reply.content = x.replyBody ?? x.commentbody;
                    reply.username = x.replyAuthor ?? x.commentauthor;
                    reply.disagreenum = x.disagreenum;
                    reply.agreenum = x.agreenum;
                    reply.isAuthor = x.isAuthor;
                    reply.icon = x.subscriptionicon;
                    reply.rate = x.subscriptionrate || (x.subscriptionicon.match(/<.*>/)?.[0] ?? '');
                    replyList.push(reply);
                }
                return replyList;
            } catch (e) {
                return [];
            }
        }

        function createHtml(JsonData, t, type) {
            let html = '';
            for (let i in JsonData) {
                const x = JsonData[i];
                if (page >= 2 && x.top) continue;
                let replyHtml = '';
                if (x.list && x.list.length > 0) {
                    let openReply = '';
                    if (x.replyNum > 5) {
                        openReply = `<div class="load-more-replies" data-id="${x.id}" data-num="5">
                            <i class="fa fa-angle-double-down"></i> 共${x.replyNum}条回复 还剩${x.replyNum - 5}条回复</div>
                        <div class="close-more-replies hide"><i class="fa fa-angle-double-up"></i> 收起回复</div>`;
                    }
                    replyHtml = `<div class="replies-section">
                        ${createHtml(x.list, 'reply')}
                        ${openReply}
                    </div>`;
                }
                let user_badges = '';
                if (x.top) {
                    user_badges = `<div class="user-badges">
                        <div class="badge primary">${x.top}</div>
                        <div class="badge accent">展开</div>
                    </div>`;
                } else if (x.icon || x.rate) {
                    user_badges = `<div class="user-badges">
                        <div class="badge gold">
                            ${x.rate.replace(/src=\/\//g, 'src=https://').replace(/style='.*?'/, 'style="display:inline-block;margin-top:3px"') || '100%'}
                        </div>
                    </div>`;
                }
                let info = '';
                if (x.agreenum >= 0) {
                    info = `<div class="comment-info">
                        <div class="comment-meta">${(x.meta ?? '').replace(/•$/, '')}</div>
                        <div class="comment-actions">
                            <div class="action-btn"><i class="far fa-thumbs-up"></i> ${x.agreenum}</div>
                            <div class="action-btn"><i class="far fa-thumbs-down"></i> ${x.disagreenum}</div>
                        </div>
                    </div>`;
                }
                let author_agree = '';
                if (x.author_agree == 1 || x.belike == 1) {
                    author_agree = `<div class="like" style="flex:1;text-align:right"><div class="badge" style="background:#E9F3EE;color:#6CAB8D;display:inline-block;">${x.belike == 1 ? '精' : '作者点赞'}</div></div>`;
                }
                html += `<div class="${t}-item${type ? ' reply-add' : ''}${x.top ? ' author-announcement' : ''}">
                    <div class="${t}-header">
                        <div class="username">${x.username}</div>
                        ${x.isAuthor == 1 ? '<div class="reply-label">作者</div>' : ''}
                        ${user_badges}
                        ${author_agree}
                    </div>
                    <div class="comment-content">${formatChineseText(replaceEmoticons(x.content))}</div>
                    ${info}
                    ${replyHtml}
                </div>`;
            }
            if (t == 'comment' && html == '') {
                html = `<div style="text-align:center;padding:10px;color:#666;font-size:14px;">暂无评论</div>`;
            }
            return html;
        }

        function createCommentHtml(JsonData) {
            if (JsonData && typeof JsonData !== 'string') {
                document.querySelector('.commentTotal').textContent = '共' + JsonData.commentTotal + '条评论';
                let html = '';
                if (page >= 2) html = '';
                html = createHtml(JsonData.list, 'comment');
                return html;
            } else {
                const loader = document.createElement('div');
                loader.className = 'loading-more';
                loader.style.cssText = 'text-align:center;padding:10px;color:#666;font-size:14px;';
                loader.textContent = typeof JsonData === 'string' ? JsonData : '加载失败，点击重试';
                loader.style.color = '#f00';
                return loader.outerHTML;
            }
        }

        function loadUrl() {
            const JsonData = getJson(currentUrl);
            const html = createCommentHtml(JsonData);
            document.getElementById('commentsContainer').innerHTML = html;
            window.scrollTo(0, 0);
            const loader = document.querySelector('.loading-more');
            wrongi--;
            if (loader && wrongi > 0) {
                java.longToast('正在重试倒数第' + wrongi + '次....');
                loadUrl();
                loader.onclick = () => {
                    java.longToast('正在重试....');
                    loader.textContent = '加载中....';
                    loadUrl();
                };
            } else {
                wrongi = 3;
            }
            openReply();
        }

        function openReply() {
            document.querySelectorAll('.load-more-replies, .close-more-replies').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    const className = this.className;
                    if (/load-more-replies/.test(className)) {
                        const repliesSection = e.target.parentNode;
                        const content = this.textContent;
                        const totalnum = Number(content.match(/共(\d+)/)[1]);
                        const dataid = this.dataset.id;
                        let datanum = Number(this.dataset.num);
                        if (datanum < totalnum) {
                            const url = `${baseReplyUrl},{"method":"POST","body":"versionCode=477&commentId=${dataid}&offset=${datanum}&limit=20&isBackend=2&novelId=${bid}&chapterId=${cid}"}`;
                            this.insertAdjacentHTML('beforebegin', createHtml(getReplyJson(url), 'reply', 1));
                            this.dataset.num = datanum + 20;
                            const synum = Number(content.match(/还剩(\d+)/)[1]) - 20;
                            if (synum > 0) {
                                this.textContent = content.replace(/还剩\d+/, '还剩' + synum);
                            } else {
                                e.target.nextElementSibling.classList.remove('hide');
                                this.classList.add('hide');
                            }
                        } else {
                            document.querySelectorAll('.reply-add').forEach(x => x.classList.remove('hide'));
                            e.target.nextElementSibling.classList.remove('hide');
                            this.classList.add('hide');
                        }
                    } else if (/close-more/.test(className)) {
                        this.classList.add('hide');
                        e.target.previousElementSibling.classList.remove('hide');
                        document.querySelectorAll('.reply-add').forEach(x => x.classList.add('hide'));
                    }
                });
            });
        }

        // ========== 事件绑定 ==========
        function bindTabs() {
            if (isPara) return;
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const type = this.dataset.type;
                    document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
                    this.classList.add('active');
                    const sortDropdown = document.getElementById('sortDropdown');
                    if (type !== 'comment') {
                        sortDropdown.style.display = 'none';
                    } else {
                        sortDropdown.style.display = 'inline-block';
                    }
                    commentTotal = 0;
                    nocommentTotal = 0;
                    page = 1;
                    hasMore = true;
                    if (type === 'long') {
                        currentUrl = `https://android.jjwxc.net/comment/getLongCommentList,{"method":"POST","body":"versionCode=477&limit=100&offset=0&novelId=${bid}&chapterId=${cid}"}`;
                    } else if (type === 'featured') {
                        currentUrl = `${baseCommentUrl},{"method":"POST","body":"versionCode=477&limit=100&authorLike=1&offset=0&novelId=${bid}&chapterId=${cid}"}`;
                    } else {
                        currentUrl = `${baseCommentUrl}?versionCode=477&limit=50&offset=0&commentSort=${order}&novelId=${bid}&chapterId=${cid}`;
                        if (vip == '1') {
                            currentUrl = `https://s8-static.jjwxc.net/comment_json.php?commentSort=${order}&chapterid=${cid}&novelid=${bid}&offset=0&limit=20`;
                        }
                    }
                    loadUrl();
                });
            });
        }

        function bindSort() {
            const sortBtn = document.querySelector('.sort-btn');
            if (!sortBtn) return;
            sortBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const content = document.getElementById('sortContent');
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            });
            document.addEventListener('click', function() {
                document.getElementById('sortContent').style.display = 'none';
            });
            document.getElementById('sortContent').addEventListener('click', function(e) {
                e.stopPropagation();
            });
            document.querySelectorAll('#sortContent a').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    document.querySelectorAll('#sortContent i').forEach(b => b.classList.remove('fa-check'));
                    this.querySelector('i').className = 'fas fa-check';
                    const sortText = this.textContent.trim();
                    commentTotal = 0;
                    nocommentTotal = 0;
                    page = 1;
                    hasMore = true;
                    if (/倒序/.test(sortText)) {
                        order = 0;
                    } else if (/正序/.test(sortText)) {
                        order = 1;
                    } else {
                        order = 2;
                    }
                    localStorage.setItem('commentSort', order);
                    currentUrl = currentUrl.replace(/offset=\d+/, 'offset=0').replace(/commentSort=\d+/, 'commentSort=' + order);
                    loadUrl();
                    java.longToast('切换至：' + sortText);
                    document.getElementById('sortContent').style.display = 'none';
                });
            });
        }

        function bindTheme() {
            document.getElementById('themeToggle').addEventListener('click', function(e) {
                e.stopPropagation();
                document.getElementById('themePanel').classList.toggle('show');
            });
            document.addEventListener('click', function() {
                document.getElementById('themePanel').classList.remove('show');
            });
            document.getElementById('themePanel').addEventListener('click', function(e) {
                e.stopPropagation();
            });
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.addEventListener('click', function() {
                    const theme = this.dataset.theme;
                    document.body.className = 'theme-' + theme;
                    localStorage.setItem('jjwxc_theme', theme);
                    document.getElementById('themePanel').classList.remove('show');
                });
            });
        }

        function bindScroll() {
            window.addEventListener('scroll', function() {
                clearTimeout(window.scrollTimer);
                window.scrollTimer = setTimeout(checkScrollBottom, 100);
            });
            document.getElementById('top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
            document.getElementById('down').addEventListener('click', () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
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
                noMore.style.cssText = 'text-align:center;padding:10px;color:#999;font-size:14px;';
                document.getElementById('commentsContainer')?.appendChild(noMore);
                return;
            }
            isLoading = true;
            const loader = document.createElement('div');
            loader.className = 'loading-more';
            loader.textContent = '加载 第' + page + '页 中...';
            loader.style.cssText = 'text-align:center;padding:10px;color:#666;font-size:14px;';
            const container = document.getElementById('commentsContainer') || document.body;
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
                    const offsetMatch = currentUrl.match(/offset=(\d+)/);
                    if (!offsetMatch) {
                        if (vip == '1') {
                            currentUrl = currentUrl.replace(/(chapterid=\d+&novelid=\d+)/, '$1&offset=0&limit=20');
                        }
                    }
                    const offset = Number(currentUrl.match(/offset=(\d+)/)?.[1] ?? 0);
                    const limit = Number(currentUrl.match(/limit=(\d+)/)?.[1] ?? 20);
                    const newOffset = offset + limit;
                    currentUrl = currentUrl.replace(/offset=\d+/, 'offset=' + newOffset);
                    const htmlString = createCommentHtml(getJson(currentUrl));
                    const container = document.getElementById('commentsContainer') || document.body;
                    const loader = container.querySelector('.loading-more');
                    if (loader) {
                        loader.insertAdjacentHTML('beforebegin', htmlString);
                    } else {
                        container.insertAdjacentHTML('beforeend', htmlString);
                    }
                    openReply();
                    resolve();
                }, 1000);
            });
        }

        // ========== 初始化执行 ==========
        buildTabBar();
        bindTabs();
        bindSort();
        bindTheme();
        bindScroll();
        loadUrl();
    }

    // 等待 DOM 加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();