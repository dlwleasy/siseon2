(function(){
      const list = document.getElementById('ccMsgList');
      const input = document.getElementById('ccInput');
      const send = document.getElementById('ccSend');
      const quick = document.querySelector('.cc-quick');

      function addMsg({text, who='self'}) {
        const row = document.createElement('div');
        row.className = 'cc-msg ' + (who==='self' ? 'cc-self' : 'cc-other');

        if (who !== 'self') {
          const av = document.createElement('div');
          av.className = 'cc-avatar';
          row.appendChild(av);
        }

        const box = document.createElement('div');
        box.className = 'cc-msgbox';
        const bubble = document.createElement('div');
        bubble.className = 'cc-bubble' + (who==='self' ? ' cc-bubble--self' : '');
        bubble.textContent = text;
        const time = document.createElement('div');
        time.className = 'cc-time';
        time.textContent = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

        box.appendChild(bubble);
        box.appendChild(time);
        row.appendChild(box);
        list.appendChild(row);
        list.scrollTop = list.scrollHeight;
      }

      quick.addEventListener('click', e => {
        const btn = e.target.closest('.cc-quick-btn');
        if (!btn) return;
        btn.classList.add('active');
        setTimeout(()=>btn.classList.remove('active'), 600);
        sendMessage(btn.textContent.trim());
      });

      send.addEventListener('click', () => { if (input.value.trim()) sendMessage(input.value.trim()); });
      input.addEventListener('keydown', e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send.click(); }});

      function sendMessage(text){
        addMsg({text, who:'self'});
        input.value = '';
        setTimeout(()=> {
          let reply = "좋아요. 그럼 그 날에 뵙겠습니다.";
          if (text.includes('어디')|| text.includes('장소')) reply = "미술관 정문 앞에서 만나면 어떨까요? 오전 11시 15분에 출발하겠습니다.";
          addMsg({text:reply, who:'other'});
        }, 900 + Math.random()*500);
      }

      list.scrollTop = list.scrollHeight;
    })();