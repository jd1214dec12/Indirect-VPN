(function () {
    var loaderBar = document.getElementById('loaderBar');
    var loaderText = document.getElementById('loaderText');
    var loader = document.getElementById('loader');
    var app = document.getElementById('app');

    var steps = [
        { p: 20, t: 'INITIALIZING CORE...' },
        { p: 45, t: 'LOADING PROTOCOLS...' },
        { p: 70, t: 'SECURING TUNNEL...' },
        { p: 90, t: 'FINALIZING...' },
        { p: 100, t: 'READY' }
    ];

    var si = 0;

    function boot() {
        if (si >= steps.length) {
            setTimeout(function () {
                loader.classList.add('gone');
                app.classList.remove('hidden');
            }, 500);
            return;
        }

        var s = steps[si];

        loaderBar.style.width = s.p + '%';
        loaderText.textContent = s.t;

        si++;

        setTimeout(boot, 400);
    }

    boot();

    var servers = [
        { name: 'Singapore', base: 23 },
        { name: 'Japan', base: 41 },
        { name: 'United States', base: 112 },
        { name: 'Germany', base: 184 },
        { name: 'Philippines', base: 8 }
    ];

    var serverList = document.getElementById('serverList');
    var active = 0;
    var pings = servers.map(function (s) {
        return s.base;
    });

    function color(p) {
        if (p <= 90) return '#4ade80';
        if (p <= 190) return '#facc15';
        return '#ef4444';
    }

    function clamp(p) {
        if (p < 1) return 1;
        if (p > 300) return 300;
        return p;
    }

    function fluc(b, r) {
        r = r || 5;
        return clamp(
            b + Math.floor(Math.random() * r * 2 - r)
        );
    }

    function drawServers() {
        serverList.innerHTML = '';

        servers.forEach(function (srv, i) {
            var d = document.createElement('div');

            d.className = 'server-item' + (i === active ? ' active' : '');

            d.innerHTML =
                '<span class="server-name">' + srv.name + '</span>' +
                '<span class="server-ping" style="color:' +
                color(pings[i]) + '">' + pings[i] + ' ms</span>';

            d.onclick = function () {
                active = i;
                drawServers();

                if (state === 'connected') {
                    updateStatus(true);
                    startLive();
                }
            };

            serverList.appendChild(d);
        });
    }

    drawServers();

    var powerBtn = document.getElementById('powerBtn');
    var powerRing = document.getElementById('powerRing');
    var powerLabel = document.getElementById('powerLabel');
    var headerStatus = document.getElementById('headerStatus');

    var ipValue = document.getElementById('ipValue');
    var locValue = document.getElementById('locValue');
    var pingValue = document.getElementById('pingValue');
    var downValue = document.getElementById('downValue');

    var popup = document.getElementById('popup');
    var popupNinja = document.getElementById('popupNinja');
    var popupSmoke = document.getElementById('popupSmoke');
    var popupText = document.getElementById('popupText');

    var state = 'disconnected';
    var liveTimer = null;
    var locked = false;

    function randomIP() {
        return [
            Math.floor(Math.random() * 200) + 20,
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 255)
        ].join('.');
    }

    function updateStatus(on) {
        if (on) {
            var srv = servers[active];
            var p = pings[active];

            ipValue.textContent = randomIP();
            locValue.textContent = srv.name.toUpperCase();
            pingValue.textContent = p + ' ms';
            pingValue.style.color = color(p);

            downValue.textContent =
                (Math.random() * 40 + 20).toFixed(1) + ' Mbps';
        } else {
            ipValue.textContent = '— . — . — . —';
            locValue.textContent = 'NOT CONNECTED';
            pingValue.textContent = '— ms';
            pingValue.style.color = '';
            downValue.textContent = '— Mbps';
        }
    }

    function startLive() {
        stopLive();

        liveTimer = setInterval(function () {
            pings[active] = fluc(servers[active].base, 6);

            drawServers();
            updateStatus(true);
        }, 1200);
    }

    function stopLive() {
        if (liveTimer) {
            clearInterval(liveTimer);
            liveTimer = null;
        }
    }

    function resetNinja() {
        popupNinja.className = 'popup-ninja';
        popupSmoke.className = 'popup-smoke';
        popupText.className = 'popup-text';
        popupText.textContent = '';

        popupNinja.style.opacity = '1';
        popupNinja.style.transform = '';
        popupNinja.style.transition = '';
    }

    function showConnectAnim(done) {
        locked = true;
        popup.classList.remove('hidden');

        resetNinja();

        void popupNinja.offsetWidth;

        popupNinja.classList.add('bounce');

        setTimeout(function () {
            popupNinja.classList.remove('bounce');
            popupNinja.classList.add('throw');
        }, 1000);

        setTimeout(function () {
            popupSmoke.classList.add('smoke-puff');
        }, 1400);

        setTimeout(function () {
            popupNinja.classList.add('vanish');
        }, 1700);

        setTimeout(function () {
            popupText.textContent = 'CONNECTED — USER ACCEPTED';
            popupText.classList.add('show', 'green');
        }, 2100);

        setTimeout(function () {
            popup.classList.add('hidden');
            locked = false;

            if (done) done();
        }, 5100);
    }

    function showDisconnectAnim(done) {
        locked = true;
        popup.classList.remove('hidden');

        resetNinja();

        popupNinja.style.transition = 'none';
        popupNinja.style.opacity = '0';
        popupNinja.style.transform = 'scale(0.3) translateY(30px)';

        void popupNinja.offsetWidth;

        setTimeout(function () {
            popupNinja.style.transition =
                'opacity .4s ease, transform .4s ease';

            popupNinja.style.opacity = '1';
            popupNinja.style.transform = 'scale(1) translateY(0)';
        }, 80);

        setTimeout(function () {
            popupNinja.classList.add('bounce');
        }, 600);

        setTimeout(function () {
            popupText.textContent = 'DISCONNECTED — BY USER APPROVED';
            popupText.classList.add('show', 'red');
        }, 1300);

        setTimeout(function () {
            popup.classList.add('hidden');
            locked = false;

            if (done) done();
        }, 4300);
    }

    function handleTap() {
        if (locked) return;

        if (state === 'disconnected') {
            state = 'connecting';

            powerRing.classList.remove('disconnected');
            powerRing.classList.add('connecting');

            powerLabel.textContent = 'CONNECTING...';
            headerStatus.textContent = '● CONNECTING';
            headerStatus.classList.remove('on');

            var ticks = 0;

            var hs = setInterval(function () {
                pings[active] = clamp(
                    servers[active].base +
                    Math.floor(Math.random() * 80 - 20)
                );

                drawServers();

                ticks++;

                if (ticks > 5) clearInterval(hs);
            }, 300);

            setTimeout(function () {
                clearInterval(hs);

                state = 'connected';

                powerRing.classList.remove('connecting');
                powerRing.classList.add('connected');

                powerLabel.textContent = 'CONNECTED';
                powerLabel.classList.add('on');

                headerStatus.textContent = '● CONNECTED';
                headerStatus.classList.add('on');

                pings[active] = servers[active].base;

                updateStatus(true);
                startLive();
                showConnectAnim();
            }, 1800);

        } else if (state === 'connected') {
            state = 'disconnecting';

            powerRing.classList.remove('connected');
            powerRing.classList.add('disconnected');

            powerLabel.textContent = 'DISCONNECTING...';
            powerLabel.classList.remove('on');

            headerStatus.textContent = '● DISCONNECTING';
            headerStatus.classList.remove('on');

            stopLive();

            pings = servers.map(function (s) {
                return s.base;
            });

            drawServers();
            updateStatus(false);

            showDisconnectAnim(function () {
                state = 'disconnected';

                powerLabel.textContent = 'TAP TO CONNECT';
                headerStatus.textContent = '● DISCONNECTED';
            });
        }
    }

    powerBtn.addEventListener('click', handleTap);

    powerBtn.addEventListener('touchend', function (e) {
        e.preventDefault();
        handleTap();
    }, { passive: false });

})();
