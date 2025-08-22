(function() {

    if (document.getElementById('dima-client-container')) {

        return;
    }

    const DIMA_CLIENT_ID = 'dima-client-container';


    let autoclickIntervalId = null;
    let isAutoclicking = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let autoclickerKeydownListener = null;
    let mouseMoveListenerGlobal = null;
    let matrixIntervalId = null;
    let matrixCanvas = null;
    let matrixCtx = null;
    const matrixFontSize = 12;
    let matrixColumns = 0;
    let matrixDrops = [];
    const matrixChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*()+=_[]{}\\|;:?/.,<>-ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽltal';

    const stylesString = `
        :root {
           --dima-bg-dark: #282c34; --dima-bg-light: #3a3f4b; --dima-accent: #e06c75;
           --dima-text: #abb2bf; --dima-text-bright: #ffffff; --dima-border: #4f5666;
           --dima-border-rgb: 79, 86, 102;
           --dima-bg-dark-rgb: 40, 44, 52;
           --dima-bg-light-rgb: 58, 63, 75;
           --dima-accent-rgb: 224, 108, 117;
           --dima-danger-rgb: 224, 108, 117;
           --dima-shadow: rgba(0, 0, 0, 0.5); --dima-shadow-light: rgba(var(--dima-accent-rgb), 0.3);
           --dima-success: #98c379; --dima-danger: #e06c75; --dima-rainbow-speed: 4s;
           --dima-animation-duration: 0.3s; --dima-animation-timing: cubic-bezier(0.25, 0.8, 0.25, 1);
           --dima-control-bar-height: 45px;
        }
        #${DIMA_CLIENT_ID} {
            position: fixed; top: 50px; left: 50px;
            min-height: var(--dima-control-bar-height); width: 520px;
            background-color: var(--dima-bg-dark); border: 1px solid var(--dima-border);
            border-radius: 16px; box-shadow: 0 15px 35px var(--dima-shadow);
            color: var(--dima-text); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            z-index: 9999999 !important; overflow: hidden; display: flex; flex-direction: column;
            opacity: 0; transform: scale(0.9) translateY(20px);
            transition: opacity var(--dima-animation-duration) var(--dima-animation-timing),
                        transform var(--dima-animation-duration) var(--dima-animation-timing),
                        width var(--dima-animation-duration) var(--dima-animation-timing),
                        min-height var(--dima-animation-duration) var(--dima-animation-timing);
            user-select: none; resize: both; min-width: 400px; min-height: 300px;
        }
        #${DIMA_CLIENT_ID}.dima-minimized { width: 220px; min-height: var(--dima-control-bar-height); border-radius: 10px; background: linear-gradient(135deg, #e06c75 0%, #d63384 100%); border: 2px solid rgba(224, 108, 117, 0.5); box-shadow: 0 8px 25px rgba(224, 108, 117, 0.3); }
        #${DIMA_CLIENT_ID}.dima-minimized #dima-main-interface { display: none; }
        #${DIMA_CLIENT_ID}.dima-minimized #dima-control-bar { border-bottom: none; background: rgba(0, 0, 0, 0.2); backdrop-filter: blur(10px); }
        #${DIMA_CLIENT_ID}.dima-minimized #dima-control-bar-title { color: #ffffff; text-shadow: 0 0 10px rgba(224, 108, 117, 0.5); }
        #${DIMA_CLIENT_ID}.dima-minimized .dima-window-controls button { color: #ffffff; }
        #${DIMA_CLIENT_ID}.dima-minimized .dima-window-controls button:hover { background-color: rgba(255, 255, 255, 0.2); }
        #${DIMA_CLIENT_ID}.dima-visible { opacity: 1; transform: scale(1) translateY(0); }
        #${DIMA_CLIENT_ID}.dima-rainbow-active { animation: dima-rainbow-border var(--dima-rainbow-speed) linear infinite; }
        @keyframes dima-rainbow-border {
            0%, 100% { border-color: hsl(0, 80%, 65%); box-shadow: 0 0 15px hsla(0, 80%, 65%, 0.5); } 17% { border-color: hsl(60, 80%, 65%); box-shadow: 0 0 15px hsla(60, 80%, 65%, 0.5); }
            33% { border-color: hsl(120, 80%, 65%); box-shadow: 0 0 15px hsla(120, 80%, 65%, 0.5); } 50% { border-color: hsl(180, 80%, 65%); box-shadow: 0 0 15px hsla(180, 80%, 65%, 0.5); }
            67% { border-color: hsl(240, 80%, 65%); box-shadow: 0 0 15px hsla(240, 80%, 65%, 0.5); } 83% { border-color: hsl(300, 80%, 65%); box-shadow: 0 0 15px hsla(300, 80%, 65%, 0.5); }
        }


        #dima-key-screen {
            padding: 0; display: flex; flex-direction: column; align-items: center;
            text-align: center; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            width: 100%; box-sizing: border-box; 
            background: linear-gradient(135deg, 
                var(--dima-bg-dark) 0%, 
                rgba(var(--dima-accent-rgb), 0.1) 50%, 
                var(--dima-bg-dark) 100%);
            gap: 0; position: relative; overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        #dima-key-screen::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle at 30% 20%, rgba(var(--dima-accent-rgb), 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 70% 80%, rgba(var(--dima-accent-rgb), 0.05) 0%, transparent 50%);
            pointer-events: none; z-index: 0;
        }
        #dima-key-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 20px 25px; 
            background: linear-gradient(90deg, 
                var(--dima-bg-light) 0%, 
                rgba(var(--dima-accent-rgb), 0.1) 100%);
            border-bottom: 1px solid rgba(var(--dima-border-rgb), 0.3); 
            cursor: move; width: 100%; box-sizing: border-box;
            position: relative; z-index: 1;
            backdrop-filter: blur(10px);
        }
        #dima-key-header-title {
            font-size: 1.2em; font-weight: 700; 
            background: linear-gradient(135deg, var(--dima-text-bright) 0%, var(--dima-accent) 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text; letter-spacing: 0.5px;
        }
        #dima-key-close-btn {
            background: rgba(var(--dima-border-rgb), 0.1); border: 1px solid rgba(var(--dima-border-rgb), 0.2);
            color: var(--dima-text); border-radius: 8px;
            font-family: 'Segoe UI Symbol', 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
            cursor: pointer; padding: 0; width: 32px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            line-height: 1; font-size: 1.2em; font-weight: bold;
            backdrop-filter: blur(5px);
        }
        #dima-key-close-btn:hover {
            color: var(--dima-text-bright); background-color: var(--dima-danger);
            transform: scale(1.1); box-shadow: 0 4px 12px rgba(var(--dima-danger-rgb), 0.3);
        }
        #dima-key-content {
            padding: 50px 40px; display: flex; flex-direction: column; align-items: center;
            text-align: center; width: 100%; box-sizing: border-box;
            gap: 30px; position: relative; z-index: 1;
        }
        #dima-key-screen.dima-hidden { opacity: 0; transform: scale(0.9); pointer-events: none; position: absolute; }
        #dima-key-title {
            font-size: 2.5em; font-weight: 800; 
            background: linear-gradient(135deg, var(--dima-text-bright) 0%, var(--dima-accent) 50%, var(--dima-text-bright) 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text; letter-spacing: 1px; margin-bottom: 0;
            text-shadow: 0 0 30px rgba(var(--dima-accent-rgb), 0.3);
            animation: dima-title-glow 3s ease-in-out infinite alternate;
        }
        @keyframes dima-title-glow {
            0% { filter: drop-shadow(0 0 5px rgba(var(--dima-accent-rgb), 0.3)); }
            100% { filter: drop-shadow(0 0 20px rgba(var(--dima-accent-rgb), 0.6)); }
        }
        #dima-key-instruction {
            font-size: 1.1em; margin-bottom: 0; color: var(--dima-text);
            max-width: 450px; line-height: 1.7; font-weight: 400;
            opacity: 0.9; letter-spacing: 0.3px;
        }
        #dima-key-display-container {
            display: flex; align-items: center; justify-content: space-between;
            background: linear-gradient(135deg, 
                rgba(var(--dima-bg-light-rgb), 0.8) 0%, 
                rgba(var(--dima-accent-rgb), 0.1) 100%);
            border: 2px solid rgba(var(--dima-accent-rgb), 0.3);
            border-radius: 15px; padding: 18px 22px;
            width: 100%; box-sizing: border-box;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2), inset 0 1px 3px rgba(255,255,255,0.1);
            backdrop-filter: blur(10px); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative; overflow: hidden;
        }
        #dima-key-display-container::before {
            content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            transition: left 0.5s ease; z-index: 0;
        }
        #dima-key-display-container:hover::before {
            left: 100%;
        }
        #dima-key-display-container:hover {
            transform: translateY(-2px); box-shadow: 0 12px 35px rgba(0,0,0,0.3);
            border-color: rgba(var(--dima-accent-rgb), 0.5);
        }
        #dima-displayed-key {
            font-family: 'JetBrains Mono', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
            font-size: 1.1em; color: var(--dima-accent); word-break: break-all;
            flex-grow: 1; text-align: left; padding-right: 15px; user-select: text;
            font-weight: 600; letter-spacing: 0.5px; position: relative; z-index: 1;
            text-shadow: 0 0 10px rgba(var(--dima-accent-rgb), 0.3);
        }
        #dima-copy-key-button {
            background: rgba(var(--dima-accent-rgb), 0.1); border: 2px solid rgba(var(--dima-accent-rgb), 0.4);
            color: var(--dima-accent); border-radius: 12px; cursor: pointer; 
            padding: 12px 16px; font-size: 1.5em; line-height: 1; position: relative; z-index: 1;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); backdrop-filter: blur(5px);
            min-width: 60px; min-height: 50px; display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 15px rgba(var(--dima-accent-rgb), 0.2);
        }
        #dima-copy-key-button:hover { 
            color: var(--dima-text-bright); background-color: var(--dima-accent);
            transform: scale(1.15) translateY(-2px); box-shadow: 0 8px 25px rgba(var(--dima-accent-rgb), 0.5);
            border-color: var(--dima-accent);
        }
        #dima-key-input {
            width: 100%; padding: 18px 20px;
            background: linear-gradient(135deg, 
                var(--dima-bg-light) 0%, 
                rgba(var(--dima-accent-rgb), 0.05) 100%);
            border: 2px solid rgba(var(--dima-border-rgb), 0.3); border-radius: 12px;
            color: var(--dima-text-bright); font-size: 1.1em; text-align: center;
            outline: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-sizing: border-box; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            backdrop-filter: blur(5px); font-weight: 500; letter-spacing: 0.5px;
        }
        #dima-key-input:focus {
            border-color: var(--dima-accent);
            box-shadow: 0 0 0 4px rgba(var(--dima-accent-rgb), 0.2), 0 8px 25px rgba(0,0,0,0.2);
            transform: translateY(-1px);
        }
        #dima-key-input.dima-shake {
            animation: dima-shake 0.5s var(--dima-animation-timing);
            border-color: var(--dima-danger) !important;
        }
        #dima-key-button {
            width: 100%; padding: 18px 25px;
            background: linear-gradient(135deg, var(--dima-accent) 0%, hsl(0, 70%, 60%) 100%);
            border: none; border-radius: 12px; color: var(--dima-bg-dark); 
            font-weight: 800; font-size: 1.2em; cursor: pointer; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            letter-spacing: 1px; box-sizing: border-box;
            box-shadow: 0 8px 25px rgba(var(--dima-accent-rgb), 0.3);
            position: relative; overflow: hidden; backdrop-filter: blur(5px);
        }
        #dima-key-button::before {
            content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s ease; z-index: 0;
        }
        #dima-key-button:hover::before {
            left: 100%;
        }
        #dima-key-button:hover {
            background: linear-gradient(135deg, hsl(0, 70%, 65%) 0%, hsl(0, 80%, 70%) 100%);
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 12px 35px rgba(var(--dima-accent-rgb), 0.4);
        }
        #dima-key-button:active {
            transform: translateY(0px) scale(0.98);
            box-shadow: 0 4px 15px rgba(var(--dima-accent-rgb), 0.3);
        }
        #dima-key-error {
            color: var(--dima-danger); font-size: 0.95em; margin-top: 0;
            min-height: 1.2em; visibility: hidden; opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 12px 18px; border-radius: 10px; width: 100%; box-sizing: border-box;
            text-align: center; font-weight: 500; backdrop-filter: blur(5px);
        }
        #dima-key-error.dima-visible {
            visibility: visible; opacity: 1;
            background: linear-gradient(135deg, 
                rgba(var(--dima-danger-rgb), 0.1) 0%, 
                rgba(var(--dima-danger-rgb), 0.05) 100%);
            border: 2px solid rgba(var(--dima-danger-rgb), 0.3);
            box-shadow: 0 4px 15px rgba(var(--dima-danger-rgb), 0.2);
            animation: dima-error-pulse 2s ease-in-out infinite;
        }
        @keyframes dima-error-pulse {
            0%, 100% { box-shadow: 0 4px 15px rgba(var(--dima-danger-rgb), 0.2); }
            50% { box-shadow: 0 4px 20px rgba(var(--dima-danger-rgb), 0.4); }
        }
        @keyframes dima-shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); } 20%, 40%, 60%, 80% { transform: translateX(8px); } }
        
        @keyframes dima-fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes dima-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        #dima-key-content > * {
            animation: dima-fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            opacity: 0;
        }
        #dima-key-content > *:nth-child(1) { animation-delay: 0.1s; }
        #dima-key-content > *:nth-child(2) { animation-delay: 0.2s; }
        #dima-key-content > *:nth-child(3) { animation-delay: 0.3s; }
        #dima-key-content > *:nth-child(4) { animation-delay: 0.4s; }
        #dima-key-content > *:nth-child(5) { animation-delay: 0.5s; }
        #dima-key-content > *:nth-child(6) { animation-delay: 0.6s; }
        
        #dima-control-bar { display: flex; align-items: center; justify-content: space-between; padding: 0 5px 0 15px; height: var(--dima-control-bar-height); background-color: var(--dima-bg-light); border-bottom: 1px solid var(--dima-border); cursor: move; }
        #dima-control-bar-title { font-size: 1.1em; font-weight: 600; color: var(--dima-text-bright); margin-right: auto; }
        .dima-window-controls { display: flex; align-items: center; }
        .dima-window-controls button {
            background: none; border: none; color: var(--dima-text);
            font-family: 'Segoe UI Symbol', 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
            cursor: pointer;
            padding: 0; width: 40px; height: var(--dima-control-bar-height);
            display: flex; align-items: center; justify-content: center;
            transition: color 0.2s ease, background-color 0.2s ease;
            line-height: 1;
        }
        .dima-window-controls button:hover { color: var(--dima-text-bright); background-color: rgba(var(--dima-border-rgb), 0.2); }
        .dima-window-controls button:active { background-color: rgba(var(--dima-border-rgb), 0.1); }
        #dima-settings-btn { font-size: 1.2em; }
        #dima-minimize-btn { font-size: 1.4em; font-weight: bold; }
        #dima-close-btn { font-size: 1.1em; font-weight: bold; }
        #dima-close-btn:hover { color: var(--dima-text-bright); background-color: var(--dima-danger) !important; }

        #dima-main-interface { display: none; flex-direction: row; flex-grow: 1; opacity: 0; animation: dima-fadeInAndScaleMain var(--dima-animation-duration) var(--dima-animation-timing) forwards; animation-delay: 0.1s; min-height: 500px; position: relative;
            background: linear-gradient(135deg, 
                var(--dima-bg-dark) 0%, 
                rgba(var(--dima-accent-rgb), 0.15) 50%, 
                var(--dima-bg-dark) 100%);
            backdrop-filter: blur(15px); border-radius: 0 0 16px 16px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(var(--dima-accent-rgb), 0.1);
            border: 2px solid rgba(var(--dima-accent-rgb), 0.2);
        }
        #dima-main-interface.dima-visible { display: flex; }
        @keyframes dima-liquid-background {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
        }
        @keyframes dima-fadeInAndScaleMain { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        #dima-sidebar { width: 160px; background: linear-gradient(180deg, rgba(var(--dima-bg-dark-rgb), 0.8) 0%, rgba(var(--dima-accent-rgb), 0.05) 100%); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); padding: 20px 0; display: flex; flex-direction: column; border-right: 2px solid rgba(var(--dima-accent-rgb), 0.3); flex-shrink: 0; z-index: 1; box-shadow: 5px 0 20px rgba(0, 0, 0, 0.2); }
        .dima-nav-header { padding: 0 20px 20px 20px; font-size: 1.2em; font-weight: 700; color: var(--dima-text-bright); border-bottom: 2px solid rgba(var(--dima-accent-rgb), 0.4); margin-bottom: 15px; text-shadow: 0 0 10px rgba(var(--dima-accent-rgb), 0.3); }
        .dima-nav-item { display: flex; align-items: center; padding: 15px 20px; cursor: pointer; color: var(--dima-text); font-size: 1em; font-weight: 500; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; border-radius: 0 8px 8px 0; margin-right: -1px; margin-bottom: 5px; }
        .dima-nav-item svg { margin-right: 10px; fill: currentColor; min-width:18px; }
        .dima-nav-item:hover { background: linear-gradient(90deg, rgba(var(--dima-accent-rgb), 0.1) 0%, rgba(var(--dima-accent-rgb), 0.05) 100%); color: var(--dima-text-bright); transform: translateX(5px); box-shadow: 0 4px 15px rgba(var(--dima-accent-rgb), 0.2); }
        .dima-nav-item.active { color: #e06c75; font-weight: 700; background: linear-gradient(90deg, rgba(224, 108, 117, 0.2) 0%, rgba(224, 108, 117, 0.1) 100%); text-shadow: 0 0 8px rgba(224, 108, 117, 0.5); }
        .dima-nav-item.active::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 5px; height: 80%; background: linear-gradient(180deg, #e06c75 0%, #d63384 100%); border-top-right-radius: 6px; border-bottom-right-radius: 6px; box-shadow: 0 0 10px rgba(224, 108, 117, 0.5); }
        #dima-content-area { flex-grow: 1; padding: 35px; display: flex; flex-direction: column; overflow-y: auto; max-height: 450px; scrollbar-width: thin; scrollbar-color: #e06c75 var(--dima-bg-dark); background: linear-gradient(135deg, rgba(var(--dima-bg-light-rgb), 0.4) 0%, rgba(var(--dima-accent-rgb), 0.1) 100%); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); z-index: 1; border-radius: 0 0 16px 0; box-shadow: inset 0 0 30px rgba(var(--dima-accent-rgb), 0.1); }
        #dima-content-area::-webkit-scrollbar { width: 10px; }
        #dima-content-area::-webkit-scrollbar-track { background: rgba(var(--dima-bg-dark-rgb), 0.5); border-radius: 6px; }
        #dima-content-area::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #e06c75 0%, #d63384 100%); border-radius: 6px; border: 1px solid rgba(224, 108, 117, 0.3); box-shadow: 0 2px 8px rgba(224, 108, 117, 0.3); }
        #dima-content-area::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #d63384 0%, #c2255c 100%); box-shadow: 0 4px 12px rgba(224, 108, 117, 0.5); }
        .dima-content-section { display: none; animation: dima-contentFadeIn 0.4s var(--dima-animation-timing) forwards; }
        .dima-content-section.active { display: block; }
        @keyframes dima-contentFadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .dima-card { background: linear-gradient(135deg, rgba(var(--dima-bg-dark-rgb), 0.9) 0%, rgba(var(--dima-accent-rgb), 0.1) 100%); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); padding: 35px; border-radius: 20px; margin-bottom: 30px; box-shadow: 0 12px 35px rgba(0,0,0,0.4), 0 0 20px rgba(var(--dima-accent-rgb), 0.1); border: 2px solid rgba(var(--dima-accent-rgb), 0.3); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .dima-card-title { font-size: 1.3em; color: var(--dima-text-bright); margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid rgba(var(--dima-accent-rgb),0.4); font-weight: 700; text-shadow: 0 0 10px rgba(var(--dima-accent-rgb), 0.3); }
        #dima-proxy-section { display: flex; align-items: center; gap: 8px; padding-right: 15px; box-sizing: border-box; overflow: hidden; }
        #dima-proxy-input { flex-grow: 1; padding: 15px; background: linear-gradient(135deg, var(--dima-bg-dark) 0%, rgba(var(--dima-accent-rgb), 0.05) 100%); border: 2px solid rgba(var(--dima-border-rgb), 0.4); border-radius: 12px; color: var(--dima-text-bright); font-size: 1em; outline: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); backdrop-filter: blur(5px); }
        #dima-proxy-input:focus { border-color: var(--dima-accent); box-shadow: 0 0 0 4px rgba(224, 108, 117, 0.3), 0 8px 25px rgba(0,0,0,0.2); transform: translateY(-1px); outline: none !important; }
        #dima-proxy-input:focus-visible { outline: none !important; box-shadow: 0 0 0 4px rgba(224, 108, 117, 0.3), 0 8px 25px rgba(0,0,0,0.2) !important; }
        #dima-proxy-input::-webkit-focus-inner { outline: none !important; }
        #dima-proxy-input::-moz-focus-inner { outline: none !important; }
        #dima-proxy-input:focus-visible { outline: none !important; }
        #dima-proxy-input:focus { outline: none !important; }
        #dima-proxy-input:active { outline: none !important; }
        #dima-proxy-input:focus-within { outline: none !important; }

        #dima-proxy-button, .dima-action-button { padding: 10px 15px; background: linear-gradient(135deg, var(--dima-accent) 0%, hsl(0, 70%, 60%) 100%); border: none; border-radius: 10px; color: var(--dima-bg-dark); font-weight: 700; font-size: 0.9em; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); text-align: center; box-shadow: 0 6px 20px rgba(var(--dima-accent-rgb), 0.3); backdrop-filter: blur(5px); min-width: 60px; max-width: 70px; flex-shrink: 0; width: 65px; }
        #dima-proxy-button:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
        #dima-proxy-input:focus + #dima-proxy-button { box-shadow: 0 0 0 4px rgba(var(--dima-accent-rgb), 0.2); }
        #dima-proxy-button:hover, .dima-action-button:hover { background: linear-gradient(135deg, hsl(0, 70%, 65%) 0%, hsl(0, 80%, 70%) 100%); transform: translateY(-3px) scale(1.05); box-shadow: 0 12px 35px rgba(var(--dima-accent-rgb), 0.4); }
        #dima-proxy-button:active, .dima-action-button:active { transform: translateY(0px) scale(0.98); box-shadow: 0 4px 15px rgba(var(--dima-accent-rgb), 0.3); }
        .dima-toggle-container { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(var(--dima-border-rgb),0.2); }
        .dima-card .dima-toggle-container:last-of-type { border-bottom: none; padding-bottom: 0; }
        .dima-card .dima-toggle-container:first-of-type { padding-top: 0; }
        .dima-toggle-label { font-size: 0.95em; display: flex; align-items: center; }
        .dima-toggle-label .dima-beta-tag, .dima-toggle-label .dima-new-tag { font-size: 0.7em; color: white; padding: 3px 6px; border-radius: 5px; margin-left: 8px; font-weight: bold; }
        .dima-toggle-label .dima-beta-tag { background-color: var(--dima-danger); }
        .dima-toggle-label .dima-new-tag { background-color: var(--dima-success); }
        .dima-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .dima-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, var(--dima-bg-dark) 0%, rgba(var(--dima-accent-rgb), 0.1) 100%); transition: .3s var(--dima-animation-timing); border-radius: 24px; border: 2px solid rgba(var(--dima-accent-rgb), 0.3); box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
        .dima-switch input { opacity: 0; width: 0; height: 0; }
        .dima-slider:before { position: absolute; content: ''; height: 16px; width: 16px; left: 2px; top: 50%; transform: translateY(-50%); background: linear-gradient(135deg, var(--dima-text) 0%, var(--dima-text-bright) 100%); transition: .3s var(--dima-animation-timing); border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
        input:checked + .dima-slider { background: linear-gradient(135deg, #e06c75 0%, #d63384 100%); border-color: transparent; box-shadow: 0 0 15px rgba(224, 108, 117, 0.5); }
        input:checked + .dima-slider:before { transform: translateX(20px) translateY(-50%); background: linear-gradient(135deg, white 0%, #f0f0f0 100%); box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
        .dima-slider-container label { display: block; margin-bottom: 10px; font-size: 0.95em; }
        input[type='range'].dima-color-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 8px; background: linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red); border-radius: 5px; outline: none; cursor: pointer; border: 1px solid var(--dima-border); }
        input[type='range'].dima-color-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; background: var(--dima-accent); border-radius: 50%; border: 3px solid var(--dima-bg-dark); cursor: pointer; transition: background-color 0.2s ease, transform 0.2s ease; }
        input[type='range'].dima-color-slider::-moz-range-thumb { width: 18px; height: 18px; background: var(--dima-accent); border-radius: 50%; border: 3px solid var(--dima-bg-dark); cursor: pointer; transition: background-color 0.2s ease; }
        input[type='range'].dima-color-slider:hover::-webkit-slider-thumb { background-color: hsl(207, 80%, 70%); transform: scale(1.1); }
        input[type='range'].dima-color-slider:hover::-moz-range-thumb { background-color: hsl(207, 80%, 70%); }
        #dima-matrix-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999998; pointer-events: none; display: none; }
        #dima-script-input { width: 100%; height: 200px; background-color: var(--dima-bg-dark); color: var(--dima-text-bright); border: 1px solid var(--dima-border); border-radius: 8px; padding: 10px; margin-bottom: 10px; font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; font-size: 0.9em; resize: vertical; box-sizing: border-box; }
        #dima-script-input:focus { border-color: var(--dima-accent); box-shadow: 0 0 0 3px var(--dima-shadow-light); }
        .dima-script-buttons-row { display: flex; gap: 10px; margin-bottom: 10px; }
        .dima-script-buttons-row:last-child { margin-bottom: 0; }
        .dima-script-buttons-row button { flex-grow: 1; padding: 10px 15px; border: none; border-radius: 8px; color: var(--dima-bg-dark); font-weight: 600; cursor: pointer; transition: background-color 0.2s ease, transform 0.15s ease; }
        .dima-script-buttons-row button:hover { transform: translateY(-2px) scale(1.02); }
        .dima-script-buttons-row button:active { transform: translateY(0px) scale(0.98); }
        #dima-script-execute-button { background-color: #e06c75; }
        #dima-script-execute-button:hover { background-color: #d63384; }
        #dima-script-execute-backup-button { background-color: var(--dima-bg-light); color: var(--dima-text-bright); border: 1px solid var(--dima-border); }
        #dima-script-execute-backup-button:hover { background-color: var(--dima-border); }
        #dima-script-save-button, #dima-script-load-button-styled { background-color: var(--dima-bg-light); color: var(--dima-text-bright); border: 1px solid var(--dima-border); }
        #dima-script-save-button:hover, #dima-script-load-button-styled:hover { background-color: var(--dima-border); }
        #dima-script-file-input { display: none; }
        .dima-about-info { text-align: center; padding: 10px 0; }
        .dima-about-info p { margin: 5px 0; font-size: 0.95em; }
        .dima-about-info .version { font-size: 0.9em; color: var(--dima-text); }
        .dima-about-info .credits { font-weight: 500; color: var(--dima-text-bright); }
        .dima-dark-mode-filter { filter: invert(1) hue-rotate(180deg); background-color: #1a1a1a; }
        .dima-dark-mode-filter img, .dima-dark-mode-filter video, .dima-dark-mode-filter iframe { filter: invert(1) hue-rotate(180deg); }
        .dima-ai-container { display: flex; flex-direction: column; height: 400px; }
        .dima-ai-chat { flex-grow: 1; overflow-y: auto; padding: 15px; background: rgba(var(--dima-bg-dark-rgb), 0.3); border-radius: 12px; margin-bottom: 15px; max-height: 300px; }
        .dima-ai-message { display: flex; margin-bottom: 15px; gap: 10px; }
        .dima-ai-message.dima-ai-user { flex-direction: row-reverse; }
        .dima-ai-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .dima-ai-assistant .dima-ai-avatar { background: linear-gradient(135deg, #e06c75 0%, #d63384 100%); }
        .dima-ai-user .dima-ai-avatar { background: linear-gradient(135deg, var(--dima-accent) 0%, hsl(0, 70%, 65%) 100%); }
        .dima-ai-text { background: rgba(var(--dima-bg-light-rgb), 0.8); padding: 12px; border-radius: 12px; max-width: 80%; word-wrap: break-word; }
        .dima-ai-user .dima-ai-text { background: rgba(var(--dima-accent-rgb), 0.2); }
        .dima-ai-input-container { display: flex; gap: 10px; margin-bottom: 10px; }
        #dima-ai-input { flex-grow: 1; padding: 12px; background: linear-gradient(135deg, var(--dima-bg-dark) 0%, rgba(var(--dima-accent-rgb), 0.05) 100%); border: 2px solid rgba(var(--dima-border-rgb), 0.4); border-radius: 12px; color: var(--dima-text-bright); font-size: 0.9em; outline: none; resize: none; }
        #dima-ai-input:focus { border-color: var(--dima-accent); box-shadow: 0 0 0 4px rgba(224, 108, 117, 0.3), 0 8px 25px rgba(0,0,0,0.2); }
        #dima-ai-send { padding: 12px 20px; background: linear-gradient(135deg, #e06c75 0%, #d63384 100%); border: none; border-radius: 12px; color: var(--dima-bg-dark); font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        #dima-ai-send:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(224, 108, 117, 0.4); }
        #dima-ai-send:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
        .dima-ai-controls { display: flex; gap: 10px; }
        .dima-ai-controls button { padding: 8px 16px; background: linear-gradient(135deg, var(--dima-bg-light) 0%, rgba(var(--dima-accent-rgb), 0.1) 100%); border: 1px solid rgba(var(--dima-border-rgb), 0.3); border-radius: 8px; color: var(--dima-text-bright); font-size: 0.85em; cursor: pointer; transition: all 0.3s ease; }
        .dima-ai-controls button:hover { background: linear-gradient(135deg, rgba(var(--dima-accent-rgb), 0.2) 0%, rgba(var(--dima-accent-rgb), 0.1) 100%); transform: translateY(-1px); }

        .dima-ai-timestamp { font-size: 0.7em; color: var(--dima-text); opacity: 0.7; margin-top: 4px; text-align: right; }
        .dima-ai-reactions { display: flex; gap: 8px; margin-top: 8px; }
        .dima-ai-reaction-btn { background: none; border: 1px solid var(--dima-border); border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 1.2em; transition: all 0.3s ease; }
        .dima-ai-reaction-btn:hover { background: rgba(var(--dima-accent-rgb), 0.2); transform: scale(1.1); }
        .dima-ai-typing { opacity: 0.8; }
        .dima-typing-indicator { display: flex; gap: 4px; align-items: center; }
        .dima-typing-indicator span { width: 8px; height: 8px; background: var(--dima-accent); border-radius: 50%; animation: dima-typing-bounce 1.4s infinite ease-in-out; }
        .dima-typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .dima-typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes dima-typing-bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        .dima-quick-actions { background: rgba(var(--dima-bg-light-rgb), 0.1); border: 1px solid var(--dima-border); border-radius: 8px; padding: 12px; margin: 8px 0; }
        .dima-quick-actions-title { font-weight: bold; color: var(--dima-text-bright); margin-bottom: 8px; font-size: 0.9em; }
        .dima-quick-actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }
        .dima-quick-actions-grid button { background: linear-gradient(135deg, var(--dima-bg-light) 0%, rgba(var(--dima-accent-rgb), 0.1) 100%); border: 1px solid var(--dima-border); border-radius: 6px; padding: 8px 12px; font-size: 0.8em; cursor: pointer; transition: all 0.3s ease; }
        .dima-quick-actions-grid button:hover { background: linear-gradient(135deg, rgba(var(--dima-accent-rgb), 0.2) 0%, rgba(var(--dima-accent-rgb), 0.1) 100%); transform: translateY(-1px); }

        .dima-ai-controls button.recording { background: linear-gradient(135deg, #e06c75 0%, #d63384 100%) !important; animation: dima-pulse 1s infinite; }
        @keyframes dima-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        .dima-ai-file-preview { background: rgba(var(--dima-bg-light-rgb), 0.1); border: 1px solid var(--dima-border); border-radius: 8px; padding: 12px; margin: 8px 0; }
        .dima-ai-file-preview img { max-width: 100%; max-height: 200px; border-radius: 4px; }
        .dima-ai-file-preview pre { background: rgba(0,0,0,0.8); border-radius: 4px; padding: 8px; overflow-x: auto; font-size: 0.8em; }

        .dima-analytics-panel { background: rgba(var(--dima-bg-light-rgb), 0.1); border: 1px solid var(--dima-border); border-radius: 8px; padding: 16px; margin: 8px 0; }
        .dima-analytics-section { margin-bottom: 16px; }
        .dima-analytics-title { font-weight: bold; color: var(--dima-text-bright); margin-bottom: 8px; font-size: 0.9em; }
        .dima-analytics-item { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 0.85em; }
        .dima-analytics-value { color: var(--dima-accent); font-weight: bold; }
        .dima-automation-panel { background: rgba(var(--dima-bg-light-rgb), 0.1); border: 1px solid var(--dima-border); border-radius: 8px; padding: 16px; margin: 8px 0; }
        .dima-automation-item { background: rgba(var(--dima-accent-rgb), 0.1); border-radius: 6px; padding: 8px; margin: 4px 0; cursor: pointer; transition: all 0.3s ease; }
        .dima-automation-item:hover { background: rgba(var(--dima-accent-rgb), 0.2); transform: translateY(-1px); }

        #dima-api-setup {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9);
            width: auto; min-width: 400px; max-width: 90vw; max-height: 90vh; z-index: 10000001;
            padding: 0; display: flex; flex-direction: column; align-items: center;
            text-align: center; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-sizing: border-box; 
            background: linear-gradient(135deg, 
                var(--dima-bg-dark) 0%, 
                rgba(var(--dima-accent-rgb), 0.1) 50%, 
                var(--dima-bg-dark) 100%);
            gap: 0; position: fixed; overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            border-radius: 20px; border: 2px solid rgba(var(--dima-accent-rgb), 0.3);
            opacity: 0; pointer-events: none;
        }
        #dima-api-setup.dima-visible {
            opacity: 1; pointer-events: all; transform: translate(-50%, -50%) scale(1);
        }
        #dima-api-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0, 0, 0, 0.7); z-index: 10000000;
            backdrop-filter: blur(5px); opacity: 0; transition: opacity 0.3s ease;
            pointer-events: none;
        }
        #dima-api-overlay.dima-visible {
            opacity: 1; pointer-events: all;
        }
        #dima-api-setup::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle at 30% 20%, rgba(var(--dima-accent-rgb), 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 70% 80%, rgba(var(--dima-accent-rgb), 0.05) 0%, transparent 50%);
            pointer-events: none; z-index: 0;
        }
        #dima-api-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 20px 25px; 
            background: linear-gradient(90deg, 
                var(--dima-bg-light) 0%, 
                rgba(var(--dima-accent-rgb), 0.1) 100%);
            border-bottom: 1px solid rgba(var(--dima-border-rgb), 0.3); 
            cursor: move; width: 100%; box-sizing: border-box;
            position: relative; z-index: 1;
            backdrop-filter: blur(10px);
        }
        #dima-api-header-title {
            font-size: 1.2em; font-weight: 700; 
            background: linear-gradient(135deg, var(--dima-text-bright) 0%, var(--dima-accent) 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text; letter-spacing: 0.5px;
        }
        #dima-api-close-btn {
            background: rgba(var(--dima-border-rgb), 0.1); border: 1px solid rgba(var(--dima-border-rgb), 0.2);
            color: var(--dima-text); border-radius: 8px;
            font-family: 'Segoe UI Symbol', 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
            cursor: pointer; padding: 0; width: 32px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            line-height: 1; font-size: 1.2em; font-weight: bold;
            backdrop-filter: blur(5px);
        }
        #dima-api-close-btn:hover {
            color: var(--dima-text-bright); background-color: var(--dima-danger);
            transform: scale(1.1); box-shadow: 0 4px 12px rgba(var(--dima-danger-rgb), 0.3);
        }
        #dima-api-content {
            padding: 40px 35px; display: flex; flex-direction: column; align-items: center;
            text-align: center; width: 100%; box-sizing: border-box;
            gap: 25px; position: relative; z-index: 1; min-width: 350px;
        }
        #dima-api-title {
            font-size: 2.5em; font-weight: 800; 
            background: linear-gradient(135deg, var(--dima-text-bright) 0%, var(--dima-accent) 50%, var(--dima-text-bright) 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text; letter-spacing: 1px; margin-bottom: 0;
            text-shadow: 0 0 30px rgba(var(--dima-accent-rgb), 0.3);
            animation: dima-title-glow 3s ease-in-out infinite alternate;
        }
        #dima-api-instruction {
            font-size: 1.1em; margin-bottom: 0; color: var(--dima-text);
            max-width: 500px; line-height: 1.7; font-weight: 400;
            opacity: 0.9; letter-spacing: 0.3px;
        }
        #dima-api-input-container {
            display: flex; flex-direction: column; gap: 20px; width: 100%; max-width: 380px; min-width: 300px;
        }
        #dima-api-input {
            background: rgba(var(--dima-bg-light-rgb), 0.8); border: 2px solid rgba(var(--dima-accent-rgb), 0.3);
            color: var(--dima-text-bright); border-radius: 12px; padding: 15px 20px;
            font-size: 1em; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); backdrop-filter: blur(10px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.2), inset 0 1px 3px rgba(255,255,255,0.1);
        }
        #dima-api-input:focus {
            outline: none; border-color: rgba(var(--dima-accent-rgb), 0.8);
            box-shadow: 0 12px 35px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.1);
            transform: translateY(-2px);
        }
        #dima-api-input::placeholder {
            color: var(--dima-text); opacity: 0.6;
        }
        #dima-api-submit-btn {
            background: linear-gradient(135deg, var(--dima-accent) 0%, #d63384 100%);
            color: var(--dima-text-bright); border: none; border-radius: 12px; padding: 15px 30px;
            font-size: 1.1em; font-weight: 700; cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); text-transform: uppercase;
            letter-spacing: 1px; box-shadow: 0 8px 25px rgba(var(--dima-accent-rgb), 0.3);
            backdrop-filter: blur(10px);
        }
        #dima-api-submit-btn:hover {
            transform: translateY(-3px); box-shadow: 0 15px 40px rgba(var(--dima-accent-rgb), 0.4);
        }
        #dima-api-submit-btn:active {
            transform: translateY(-1px);
        }
        #dima-api-instructions-btn {
            background: rgba(var(--dima-bg-light-rgb), 0.8); border: 2px solid rgba(var(--dima-accent-rgb), 0.3);
            color: var(--dima-text-bright); border-radius: 12px; padding: 12px 25px;
            font-size: 1em; font-weight: 600; cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); backdrop-filter: blur(10px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.2), inset 0 1px 3px rgba(255,255,255,0.1);
        }
        #dima-api-instructions-btn:hover {
            transform: translateY(-2px); border-color: rgba(var(--dima-accent-rgb), 0.6);
            box-shadow: 0 12px 35px rgba(0,0,0,0.3);
        }
        #dima-api-example {
            background: rgba(var(--dima-bg-light-rgb), 0.5); border: 1px solid rgba(var(--dima-border-rgb), 0.3);
            border-radius: 8px; padding: 15px; margin-top: 10px;
            font-family: 'Courier New', monospace; font-size: 0.9em; color: var(--dima-text);
            opacity: 0.8; max-width: 400px;
        }
        #dima-api-notification {
            position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 100%);
            border: 2px solid #e06c75; border-radius: 16px; padding: 25px;
            color: #f0f0f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            z-index: 10000000; max-width: 500px; max-height: 80vh; overflow-y: auto; 
            box-shadow: 0 20px 40px rgba(224, 108, 117, 0.3), 0 0 0 1px rgba(224, 108, 117, 0.1);
            backdrop-filter: blur(15px); transform: translateX(550px); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 0;
            scrollbar-width: thin;
            scrollbar-color: #e06c75 #2d1b1b;
        }
        #dima-api-notification::-webkit-scrollbar {
            width: 8px;
        }
        #dima-api-notification::-webkit-scrollbar-track {
            background: linear-gradient(180deg, #2d1b1b 0%, #1a1a1a 100%);
            border-radius: 10px;
            border: 1px solid rgba(224, 108, 117, 0.2);
        }
        #dima-api-notification::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #e06c75 0%, #d63384 100%);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.2);
        }
        #dima-api-notification::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #f0808a 0%, #e06c75 100%);
            box-shadow: 0 0 10px rgba(224, 108, 117, 0.5);
        }
        #dima-api-notification::-webkit-scrollbar-corner {
            background: #2d1b1b;
        }
        #dima-api-notification.dima-visible {
            transform: translateX(0); opacity: 1;
        }
        #dima-api-notification-header {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
            padding-bottom: 15px; border-bottom: 2px solid rgba(224, 108, 117, 0.3);
        }
        #dima-api-notification-title {
            font-size: 1.3em; font-weight: 800; color: #ffffff;
            text-shadow: 0 0 10px rgba(224, 108, 117, 0.5);
            background: linear-gradient(135deg, #ffffff 0%, #e06c75 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        #dima-api-notification-close {
            background: rgba(224, 108, 117, 0.1); border: 1px solid rgba(224, 108, 117, 0.3); color: #e06c75; cursor: pointer;
            font-size: 1.2em; padding: 0; width: 28px; height: 28px;
            display: flex; align-items: center; justify-content: center; border-radius: 8px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(5px);
        }
        #dima-api-notification-close:hover {
            background: rgba(224, 108, 117, 0.3); color: #ffffff; transform: scale(1.1);
            box-shadow: 0 0 15px rgba(224, 108, 117, 0.5);
        }
        #dima-api-notification-content {
            font-size: 0.95em; line-height: 1.7; color: #f0f0f0;
        }
        #dima-api-notification-content h3 {
            color: #e06c75; margin: 15px 0 8px 0; font-size: 1.1em; font-weight: 700;
            text-shadow: 0 0 8px rgba(224, 108, 117, 0.3);
        }
        #dima-api-notification-content ul {
            margin: 8px 0; padding-left: 25px;
        }
        #dima-api-notification-content li {
            margin: 6px 0; padding: 3px 0;
        }
        #dima-api-notification-content code {
            background: rgba(224, 108, 117, 0.15); padding: 3px 8px; border-radius: 6px;
            font-family: 'Courier New', monospace; font-size: 0.9em; color: #e06c75;
            border: 1px solid rgba(224, 108, 117, 0.3);
        }


    `;



    const keyScreenHTMLString = `
        <div id="dima-key-screen">
            <div id="dima-key-header">
                <span id="dima-key-header-title">🔐 9Shadows Key System</span>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <a href="https://discord.gg/9shadows" target="_blank" style="display: inline-flex; align-items: center; color: #5865F2; text-decoration: none; font-size: 16px; transition: all 0.3s ease; opacity: 0.8;" title="Join Discord">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                    </a>
                    <button id="dima-key-close-btn" title="Close">✕</button>
                </div>
            </div>
            <div id="dima-key-content">
                <div id="dima-key-title">🔐 9Shadows Key System</div>
                <div id="dima-key-instruction">Please verify your access by pasting the provided key below to unlock the client.</div>
            <div id="dima-key-display-container">
                    <code id="dima-displayed-key">Get Key</code>
                    <button id="dima-copy-key-button" title="Get Key">🔑</button>
                </div>
                <input type="password" id="dima-key-input" placeholder="🔑 Enter your access key here...">
                <button id="dima-key-button">🚀 Verify & Enter</button>
                <div id="dima-key-error"></div>
            </div>
        </div>
    `;

    const apiSetupHTMLString = `
        <div id="dima-api-overlay"></div>
        <div id="dima-api-setup">
            <div id="dima-api-header">
                <span id="dima-api-header-title">🔑 AI API Key Setup</span>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <a href="https://discord.gg/9shadows" target="_blank" style="display: inline-flex; align-items: center; color: #5865F2; text-decoration: none; font-size: 16px; transition: all 0.3s ease; opacity: 0.8;" title="Join Discord">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                    </a>
                    <button id="dima-api-close-btn" title="Close">✕</button>
                </div>
            </div>
            <div id="dima-api-content">
                <div id="dima-api-title">🔑 API Key Required</div>
                <div id="dima-api-instruction">To use the AI Assistant, you need to provide your own API key from any AI service provider.</div>
                <div id="dima-api-input-container">
                    <input type="password" id="dima-api-input" placeholder="🔑 Enter your API key here...">
                    <button id="dima-api-submit-btn">🚀 Save & Continue</button>
                    <button id="dima-api-instructions-btn">📋 Get Instructions</button>
                </div>
                <div id="dima-api-example">
                    Example API Key Format: <code>sk-1234567890abcdef1234567890abcdef1234567890abcdef</code>
                </div>
            </div>
        </div>
    `;

    const mainMenuHTMLString = `
        <div id="dima-control-bar">
                            <span id="dima-control-bar-title">9Shadows Client</span>
                            <a href="https://discord.gg/9shadows" target="_blank" style="display: inline-flex; align-items: center; margin-left: 10px; color: #5865F2; text-decoration: none; font-size: 18px; transition: all 0.3s ease; opacity: 0.8;" title="Join Discord">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                                </svg>
                            </a>
            <div class="dima-window-controls">
                <button id="dima-settings-btn" title="Settings">⚙</button>
                <button id="dima-minimize-btn" title="Minimize">−</button>
                <button id="dima-close-btn" title="Close">✕</button>
            </div>
        </div>
        <div id="dima-main-interface">
            <div id="dima-sidebar">
                <div class="dima-nav-header">Navigation</div>
                <div class="dima-nav-item" data-section="proxy"> 
                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24 5 5s2.24 5 5 5h4v-2zm-3-4h8v2H8v-2z"/></svg>
                    Proxy
                </div>
                <div class="dima-nav-item" data-section="mods">
                     <svg viewBox="0 0 24 24" width="18" height="18"><path d="M3.783 14.394A3.001 3.001 0 016 12.001c0-1.102.602-2.055 1.481-2.555L6 6.001H3v2h1.51C3.568 8.878 3 10.366 3 12.001c0 1.02.312 1.948.844 2.723L3 16.001v2h3.007l-.224-.607zM21 6.001h-3l-1.488 3.445A2.99 2.99 0 0118 12.001a2.99 2.99 0 01-1.488 2.555L18 18.001h3v-2h-1.51a3.007 3.007 0 00.942-1.278c.14-.38.22-.791.22-1.223a3.001 3.001 0 00-1.068-2.127.436.436 0 00.068-.272c0-.414-.166-.798-.437-1.082A2.985 2.985 0 0019.51 8.001H21v-2zm-9 2a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4z"/></svg>
                    Mods
                </div>
                <div class="dima-nav-item" data-section="mods2">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    Mods 2
                </div>
                <div class="dima-nav-item" data-section="ai">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    AI Assistant
                </div>
                <div class="dima-nav-item" data-section="fun">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5s.67 1.5 1.5 1.5zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
                    Fun
                </div>
                <div class="dima-nav-item" data-section="script">
                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path></svg>
                    Script
                </div>
            </div>
            <div id="dima-content-area">
                <div id="dima-content-section-proxy" class="dima-content-section">
                    <div class="dima-card"><div class="dima-card-title">Proxy Connection</div><div id="dima-proxy-section"><input type="text" id="dima-proxy-input" placeholder="Enter URL (e.g., google.com)"><button id="dima-proxy-button">Go</button></div></div>
                    <div class="dima-card">
                        <div class="dima-card-title">Proxy 2</div>
                        <div style="text-align: center; padding: 20px;">
                            <button id="dima-proxy2-button" style="background: linear-gradient(135deg, #e06c75 0%, #d63384 100%); border: none; border-radius: 12px; color: white; padding: 15px 30px; font-size: 16px; font-weight: bold; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(224, 108, 117, 0.3);">Click me!</button>
                        </div>
                    </div>
                    <div class="dima-card"><div class="dima-card-title">Utilities</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">VPN V1.6</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-vpn"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Anti Light Speed V2 <span class="dima-new-tag">NEW</span></span><label class="dima-switch"><input type="checkbox" id="dima-toggle-als"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Anti Admin V1.4</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-aa"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Virtual Clone <span class="dima-beta-tag">BETA</span></span><label class="dima-switch"><input type="checkbox" id="dima-toggle-vc"><span class="dima-slider"></span></label></div>
                    </div>
                </div>
                <div id="dima-content-section-mods" class="dima-content-section">
                    <div class="dima-card"><div class="dima-card-title">Page Tools</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Dark Website</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-dark"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Light Website</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-light"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Inspect Page</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-inspect"><span class="dima-slider"></span></label></div>
                    </div>
                     <div class="dima-card"><div class="dima-card-title">Page Actions</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Hard Reset Page</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-hardreset"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Destroy Page</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-destroypage"><span class="dima-slider"></span></label></div>
                    </div>
                    <div class="dima-card"><div class="dima-card-title">Content Modifiers</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Image Replacer</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-imagereplacer"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Style Injector</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-styleinjector"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Font Changer</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-fontchanger"><span class="dima-slider"></span></label></div>
                    </div>
                    <div class="dima-card"><div class="dima-card-title">Page Effects</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Blur Effect</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-blur"><span class="dima-slider"></span></label></div>
                    </div>
                    <div class="dima-card"><div class="dima-card-title">Page Information</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Page Info</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-pageinfo"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Element Counter</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-elementcounter"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Link Extractor</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-linkextractor"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Image Downloader</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-imagedownloader"><span class="dima-slider"></span></label></div>
                    </div>
                    <div class="dima-card"><div class="dima-card-title">Page Manipulation</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Text Highlighter</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-texthighlighter"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Element Mover</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-elementmover"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Color Picker</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-colorpicker"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Screenshot Tool</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-screenshot"><span class="dima-slider"></span></label></div>
                    </div>
                    <div class="dima-card"><div class="dima-card-title">Page Utilities</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Word Counter</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-wordcounter"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Password Revealer</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-passwordrevealer"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Form Filler</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-formfiller"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Cookie Manager</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-cookiemanager"><span class="dima-slider"></span></label></div>
                    </div>
                </div>
                <div id="dima-content-section-mods2" class="dima-content-section">
                    <div class="dima-card"><div class="dima-card-title">Advanced Mods</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Element Remover</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-elementremover"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Text Changer</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-textchanger"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Glitch Effect</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-glitch"><span class="dima-slider"></span></label></div>
                    </div>
                    <div class="dima-card"><div class="dima-card-title">Page Security</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Anti-Detection</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-antidetection"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Script Blocker</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-scriptblocker"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Ad Blocker</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-adblocker"><span class="dima-slider"></span></label></div>
                    </div>
                    <div class="dima-card"><div class="dima-card-title">Page Fun</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Confetti</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-confetti"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Cursor Trails</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-cursortrails"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Page Shake</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-pageshake"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Text Scrambler</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-textscrambler"><span class="dima-slider"></span></label></div>
                    </div>
                    <div class="dima-card"><div class="dima-card-title">Advanced Effects</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">3D Transform</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-3dtransform"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Particle System</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-particlesystem"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Wave Effect</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-waveeffect"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Neon Glow</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-neonglow"><span class="dima-slider"></span></label></div>
                    </div>
                    <div class="dima-card"><div class="dima-card-title">Page Analysis</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Meta Inspector</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-metainspector"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Performance Monitor</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-performancemonitor"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Network Inspector</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-networkinspector"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Security Scanner</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-securityscanner"><span class="dima-slider"></span></label></div>
                    </div>
                </div>
                <div id="dima-content-section-ai" class="dima-content-section">
                    <div class="dima-card">
                        <div class="dima-card-title">AI Assistant</div>
                        <div id="dima-ai-setup-container">
                            <div style="text-align: center; padding: 40px 20px;">
                                <div style="font-size: 3em; margin-bottom: 20px;">🔑</div>
                                <div style="font-size: 1.5em; font-weight: 700; color: var(--dima-text-bright); margin-bottom: 15px;">API Key Required</div>
                                <div style="color: var(--dima-text); margin-bottom: 30px; line-height: 1.6;">To use the AI Assistant, you need to provide your own API key from any AI service provider.</div>
                                <button id="dima-ai-setup-btn" style="background: linear-gradient(135deg, var(--dima-accent) 0%, #d63384 100%); color: var(--dima-text-bright); border: none; border-radius: 12px; padding: 15px 30px; font-size: 1.1em; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 8px 25px rgba(var(--dima-accent-rgb), 0.3); backdrop-filter: blur(10px);">🔑 Setup API Key</button>
                            </div>
                        </div>
                        <div id="dima-ai-main-container" style="display: none;">
                        <div class="dima-ai-container">
                            <div class="dima-ai-chat" id="dima-ai-chat">
                                <div class="dima-ai-message dima-ai-assistant">
                                    <div class="dima-ai-avatar">🤖</div>
                                    <div class="dima-ai-text">Hello! I'm your AI assistant. How can I help you today?</div>
                                </div>
                            </div>
                            <div class="dima-ai-input-container">
                                <textarea id="dima-ai-input" placeholder="Ask me anything..." rows="3"></textarea>
                                <button id="dima-ai-send">Send</button>
                            </div>
                            <div class="dima-ai-controls">
                                <button id="dima-ai-suggestions">Smart Suggestions</button>
                                <button id="dima-ai-quick-actions">Quick Actions</button>
                                <button id="dima-ai-voice">🎤 Voice</button>
                                <button id="dima-ai-upload">📁 Upload</button>
                                <button id="dima-ai-screenshot">📸 Screenshot</button>
                                <button id="dima-ai-export">💾 Export</button>
                                <button id="dima-ai-analytics">📊 Analytics</button>
                                <button id="dima-ai-automation">🤖 Auto-Mods</button>
                                <button id="dima-ai-clear">Clear Chat</button>
                                <button id="dima-ai-copy">Copy Last Response</button>
                            </div>
                            <input type="file" id="dima-ai-file-input" accept=".txt,.js,.html,.css,.json,.png,.jpg,.jpeg" style="display: none;">
                            <input type="file" id="dima-ai-screenshot-input" accept="image/*" style="display: none;">
                            </div>
                        </div>
                    </div>
                </div>
                <div id="dima-content-section-fun" class="dima-content-section">
                     <div class="dima-card"><div class="dima-card-title">Fun</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Matrix Effect</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-matrix"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Autoclicker (Stop: \`)</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-autoclick"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Page Spammer (100 Tabs, Once)</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-pagespam"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Rainbow Cursor</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-rainbowcursor"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Page Explosion</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-pageexplosion"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Gravity Effect</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-gravity"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Page Flip</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-pageflip"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Random Colors</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-randomcolors"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Page Melt</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-pagemelt"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Bouncing Elements</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-bouncing"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Page Tornado</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-tornado"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Disco Mode</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-disco"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Page Earthquake</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-earthquake"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Floating Elements</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-floating"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Page Vortex</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-vortex"><span class="dima-slider"></span></label></div>
                    </div>
                </div>
                <div id="dima-content-section-script" class="dima-content-section">
                     <div class="dima-card">
                        <div class="dima-card-title">Script Executor</div>
                        <textarea id="dima-script-input" placeholder="Enter JavaScript code here..."></textarea>
                        <div class="dima-script-buttons-row">
                            <button id="dima-script-execute-button">Execute</button>
                            <button id="dima-script-execute-backup-button">Backup Execute</button>
                        </div>
                        <div class="dima-script-buttons-row">
                             <button id="dima-script-save-button">Save Script</button>
                             <button id="dima-script-load-button-styled">Load Script</button>
                             <input type="file" id="dima-script-file-input" accept=".js,.txt">
                        </div>
                    </div>
                </div>
                <div id="dima-content-section-settings" class="dima-content-section">
                    <div class="dima-card">
                        <div class="dima-card-title">About</div>
                        <div class="dima-about-info">
                            <p class="credits" style="font-size: 1.2em; color: #e06c75;">9Shadows Key System</p>
                            <p class="version">Version: V15.1</p>
                            <p>Developed by <span style="color: var(--dima-text-bright); font-weight:bold;">Kona</span> and <span style="color: var(--dima-text-bright); font-weight:bold;">Bozzz</span></p>
                            <p><a href="https://discord.gg/9Shadows" target="_blank" style="color: var(--dima-accent); text-decoration: none; font-weight: bold; transition: all 0.3s ease;">Modified by wekilledtheunicorns</a></p>
                        </div>
                    </div>
                    <div class="dima-card">
                        <div class="dima-card-title">Menu Appearance</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Rainbow Menu Border</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-rainbow"><span class="dima-slider"></span></label></div>
                        <div class="dima-slider-container"><label for="dima-color-slider">Custom Menu Accent</label><input type="range" id="dima-color-slider" class="dima-color-slider" min="0" max="360" value="207"></div>
                    </div>
                     <div class="dima-card">
                        <div class="dima-card-title">Client Options</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Reset Menu</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-resetmenu"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Client Fix</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-clientfix"><span class="dima-slider"></span></label></div>
                    </div>
                    <div class="dima-card">
                        <div class="dima-card-title">Keybind Settings</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Toggle Keybind (Ctrl+Shift+K)</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-keybind"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Quick Hide (Ctrl+H)</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-quickhide"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Emergency Close (Ctrl+Shift+X)</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-emergency"><span class="dima-slider"></span></label></div>
                    </div>
                    <div class="dima-card">
                        <div class="dima-card-title">Performance Settings</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Low Performance Mode</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-lowperf"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Auto-Save Settings</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-autosave"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Background Processing</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-background"><span class="dima-slider"></span></label></div>
                    </div>
                    <div class="dima-card">
                        <div class="dima-card-title">Security Settings</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Stealth Mode</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-stealth"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Auto-Hide on Tab Switch</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-autohide"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Session Encryption</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-encryption"><span class="dima-slider"></span></label></div>
                    </div>
                    <div class="dima-card">
                        <div class="dima-card-title">Interface Settings</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Compact Mode</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-compact"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Always on Top</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-alwaystop"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Transparency Mode</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-transparency"><span class="dima-slider"></span></label></div>
                        <div class="dima-slider-container"><label for="dima-opacity-slider">Menu Opacity</label><input type="range" id="dima-opacity-slider" class="dima-opacity-slider" min="20" max="100" value="100"></div>
                    </div>
                    <div class="dima-card">
                        <div class="dima-card-title">Advanced Settings</div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Debug Mode</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-debug"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Developer Tools</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-devtools"><span class="dima-slider"></span></label></div>
                        <div class="dima-toggle-container"><span class="dima-toggle-label">Experimental Features</span><label class="dima-switch"><input type="checkbox" id="dima-toggle-experimental"><span class="dima-slider"></span></label></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const scriptParts = [
        `const DIMA_CLIENT_ID = '${DIMA_CLIENT_ID}';`,
        `const REQUIRED_KEY = 'shadowzontop1';`,
        "let autoclickIntervalId = null; let isAutoclicking = false; let lastMouseX = 0; let lastMouseY = 0;",
        "let autoclickerKeydownListener = null; let mouseMoveListenerGlobal = null;",
        "let matrixIntervalId = null; let matrixCanvas = null; let matrixCtx = null;",
        `const matrixFontSize = ${matrixFontSize}; let matrixColumns = 0; let matrixDrops = [];`,
        `const matrixChars = '${matrixChars.replace(/'/g, "\\'")}';`,
        `const stylesString = ${JSON.stringify(stylesString)};`,

        `const keyScreenHTMLString = ${JSON.stringify(keyScreenHTMLString)};`,
        `const apiSetupHTMLString = ${JSON.stringify(apiSetupHTMLString)};`,
        `const mainMenuHTMLString = ${JSON.stringify(mainMenuHTMLString)};`,
        "const styleSheetElement = document.createElement('style'); styleSheetElement.textContent = stylesString; document.head.appendChild(styleSheetElement);",
        "const clientContainer = document.createElement('div'); clientContainer.id = DIMA_CLIENT_ID;",
        "function parseHTML(htmlString) { const template = document.createElement('template'); template.innerHTML = htmlString.trim(); return template.content.cloneNode(true); }",
        "clientContainer.appendChild(parseHTML(keyScreenHTMLString)); document.body.appendChild(clientContainer);",
        "setTimeout(() => { if (clientContainer) clientContainer.classList.add('dima-visible'); }, 10);",




        "const keyInputElement = document.getElementById('dima-key-input');",
        "const keyButtonElement = document.getElementById('dima-key-button');",
        "const keyErrorElement = document.getElementById('dima-key-error');",
        "const keyScreenElement = document.getElementById('dima-key-screen');",
        "const keyHeaderElement = document.getElementById('dima-key-header');",
        "const keyCloseButtonElement = document.getElementById('dima-key-close-btn');",
        "const displayedKeyElement = document.getElementById('dima-displayed-key');",
        "const copyKeyButtonElement = document.getElementById('dima-copy-key-button');",
        "",
        "if (copyKeyButtonElement && displayedKeyElement) {",
        "    copyKeyButtonElement.onclick = () => {",
        "        try {",
        "            window.open('https://direct-link.net/1374925/r3AhrFYDxcO3', '_blank');",
        "            copyKeyButtonElement.textContent = '✓';",
        "            setTimeout(() => {",
        "                copyKeyButtonElement.innerHTML = '🔑';",
        "            }, 1500);",
        "        } catch (e) {",
        "            ",
        "        }",
        "    };",
        "}",
        "",
        "const handleUnlockAttempt = () => {",
        "    if (keyInputElement.value === REQUIRED_KEY) {",
        "        keyErrorElement.classList.remove('dima-visible');",
        "        keyScreenElement.classList.add('dima-hidden');",
        "        setTimeout(() => {",
        "            if (keyScreenElement && keyScreenElement.parentNode) keyScreenElement.remove();",
        "            clientContainer.appendChild(parseHTML(mainMenuHTMLString));",
        "            const mainInterface = document.getElementById('dima-main-interface');",
        "            if (!mainInterface) {",
        "                if(typeof alert === 'function') alert('DimaClient Error: Failed to load main interface.');",
        "                return;",
        "            }",
        "            mainInterface.classList.add('dima-visible');",
        "            try {",
        "                initializeMainMenu();",
        "            } catch (e) {",
        "                if(typeof alert === 'function') alert('DimaClient Warning: Main interface loaded but initialization failed. Some features might not work. Error: ' + e.message);",
        "            }",
        "        }, 250);",
        "    } else {",
        "        keyInputElement.classList.add('dima-shake');",
        "        keyErrorElement.textContent = 'Incorrect Key. Access Denied.';",
        "        keyErrorElement.classList.add('dima-visible');",
        "        keyInputElement.value = '';",
        "        setTimeout(() => {",
        "            keyInputElement.classList.remove('dima-shake');",
        "        }, 500);",
        "    }",
        "};",
        "",
        "keyButtonElement.onclick = handleUnlockAttempt;",
        "keyInputElement.onkeypress = function(e) {",
        "    if (e.key === 'Enter') {",
        "        handleUnlockAttempt();",
        "    } else {",
        "        keyErrorElement.classList.remove('dima-visible');",
        "    }",
        "};",
        "",
        "if (keyCloseButtonElement) {",
        "    keyCloseButtonElement.onclick = () => {",
        "        if (clientContainer && clientContainer.parentNode) clientContainer.remove();",
        "        if (styleSheetElement && styleSheetElement.parentNode) styleSheetElement.remove();",
        "    };",
        "}",
        "",

        "let isKeyDragging = false; let keyOffsetX, keyOffsetY;",
        "if (keyHeaderElement) {",
        "    keyHeaderElement.onmousedown = function(e) {",
        "        if (e.target.closest('#dima-key-close-btn')) return;",
        "        isKeyDragging = true;",
        "        keyOffsetX = e.clientX - clientContainer.offsetLeft;",
        "        keyOffsetY = e.clientY - clientContainer.offsetTop;",
        "        clientContainer.style.transition = 'opacity var(--dima-animation-duration) var(--dima-animation-timing), transform var(--dima-animation-duration) var(--dima-animation-timing)';",
        "        keyHeaderElement.style.cursor = 'grabbing';",
        "        e.preventDefault();",
        "    };",
        "}",
        "",

        "const keyMouseMoveHandler = function(e) {",
        "    if (!isKeyDragging || !clientContainer) return;",
        "    let newX = e.clientX - keyOffsetX;",
        "    let newY = e.clientY - keyOffsetY;",
        "    const maxX = window.innerWidth - clientContainer.offsetWidth;",
        "    const maxY = window.innerHeight - clientContainer.offsetHeight;",
        "    newX = Math.max(0, Math.min(newX, maxX));",
        "    newY = Math.max(0, Math.min(newY, maxY));",
        "    clientContainer.style.left = newX + 'px';",
        "    clientContainer.style.top = newY + 'px';",
        "};",
        "",
        "const keyMouseUpHandler = function() {",
        "    if (isKeyDragging) {",
        "        isKeyDragging = false;",
        "        if(clientContainer) clientContainer.style.transition = `opacity var(--dima-animation-duration) var(--dima-animation-timing), transform var(--dima-animation-duration) var(--dima-animation-timing), width var(--dima-animation-duration) var(--dima-animation-timing), min-height var(--dima-animation-duration) var(--dima-animation-timing)`;",
        "        if (keyHeaderElement) keyHeaderElement.style.cursor = 'move';",
        "    }",
        "};",
        "",
        "document.addEventListener('mousemove', keyMouseMoveHandler);",
        "document.addEventListener('mouseup', keyMouseUpHandler);",

        "function initializeApiSetup() {",
        "    const apiSetupElement = document.getElementById('dima-api-setup');",
        "    const apiOverlayElement = document.getElementById('dima-api-overlay');",
        "    const apiHeaderElement = document.getElementById('dima-api-header');",
        "    const apiCloseButtonElement = document.getElementById('dima-api-close-btn');",
        "    const apiInputElement = document.getElementById('dima-api-input');",
        "    const apiSubmitButtonElement = document.getElementById('dima-api-submit-btn');",
        "    const apiInstructionsButtonElement = document.getElementById('dima-api-instructions-btn');",

        "    const adjustSize = function() {",
        "        if (apiSetupElement) {",
        "            const content = apiSetupElement.querySelector('#dima-api-content');",
        "            if (content) {",
        "                const contentWidth = content.scrollWidth + 70;",
        "                const contentHeight = content.scrollHeight + 100;",
        "                const maxWidth = Math.min(contentWidth, window.innerWidth * 0.9);",
        "                const maxHeight = Math.min(contentHeight, window.innerHeight * 0.9);",
        "                apiSetupElement.style.width = maxWidth + 'px';",
        "                apiSetupElement.style.height = maxHeight + 'px';",
        "            }",
        "        }",
        "    };",
        "    ",
        "    setTimeout(() => {",
        "        adjustSize();",
        "        if (apiSetupElement) apiSetupElement.classList.add('dima-visible');",
        "        if (apiOverlayElement) apiOverlayElement.classList.add('dima-visible');",
        "    }, 100);",

        "    const closePopup = function() {",
        "        if (apiSetupElement) apiSetupElement.classList.remove('dima-visible');",
        "        if (apiOverlayElement) apiOverlayElement.classList.remove('dima-visible');",
        "        window.removeEventListener('resize', adjustSize);",
        "        setTimeout(() => {",
        "            if (apiSetupElement && apiSetupElement.parentNode) apiSetupElement.remove();",
        "            if (apiOverlayElement && apiOverlayElement.parentNode) apiOverlayElement.remove();",
        "        }, 300);",
        "    };",

        "    if (apiCloseButtonElement) {",
        "        apiCloseButtonElement.onclick = closePopup;",
        "    }",

        "    if (apiOverlayElement) {",
        "        apiOverlayElement.onclick = closePopup;",
        "    }",
        "    ",
        "    window.addEventListener('resize', adjustSize);",

        "    if (apiSubmitButtonElement && apiInputElement) {",
        "        apiSubmitButtonElement.onclick = function() {",
        "            const apiKey = apiInputElement.value.trim();",
        "            if (apiKey) {",
        "                localStorage.setItem('dima_ai_api_key', apiKey);",
        "                window.GROQ_API_KEY = apiKey;",
        "                closePopup();",
        "                const aiSetupContainer = document.getElementById('dima-ai-setup-container');",
        "                const aiMainContainer = document.getElementById('dima-ai-main-container');",
        "                if (aiSetupContainer && aiMainContainer) {",
        "                    aiSetupContainer.style.display = 'none';",
        "                    aiMainContainer.style.display = 'block';",
        "                }",
        "            }",
        "        };",
        "    }",

        "    if (apiInstructionsButtonElement) {",
        "        apiInstructionsButtonElement.onclick = function() {",
        "            showApiInstructions();",
        "        };",
        "    }",

        "    let isApiDragging = false; let apiOffsetX, apiOffsetY;",
        "    if (apiHeaderElement) {",
        "        apiHeaderElement.onmousedown = function(e) {",
        "            if (e.target.closest('#dima-api-close-btn')) return;",
        "            isApiDragging = true;",
        "            apiOffsetX = e.clientX - clientContainer.offsetLeft;",
        "            apiOffsetY = e.clientY - clientContainer.offsetTop;",
        "            clientContainer.style.transition = 'opacity var(--dima-animation-duration) var(--dima-animation-timing), transform var(--dima-animation-duration) var(--dima-animation-timing)';",
        "            apiHeaderElement.style.cursor = 'grabbing';",
        "            e.preventDefault();",
        "        };",
        "    }",

        "    const apiMouseMoveHandler = function(e) {",
        "        if (!isApiDragging || !clientContainer) return;",
        "        let newX = e.clientX - apiOffsetX;",
        "        let newY = e.clientY - apiOffsetY;",
        "        const maxX = window.innerWidth - clientContainer.offsetWidth;",
        "        const maxY = window.innerHeight - clientContainer.offsetHeight;",
        "        newX = Math.max(0, Math.min(newX, maxX));",
        "        newY = Math.max(0, Math.min(newY, maxY));",
        "        clientContainer.style.left = newX + 'px';",
        "        clientContainer.style.top = newY + 'px';",
        "    };",

        "    const apiMouseUpHandler = function() {",
        "        if (isApiDragging) {",
        "            isApiDragging = false;",
        "            if(clientContainer) clientContainer.style.transition = `opacity var(--dima-animation-duration) var(--dima-animation-timing), transform var(--dima-animation-duration) var(--dima-animation-timing), width var(--dima-animation-duration) var(--dima-animation-timing), min-height var(--dima-animation-duration) var(--dima-animation-timing)`;",
        "            if (apiHeaderElement) apiHeaderElement.style.cursor = 'move';",
        "        }",
        "    };",

        "    document.addEventListener('mousemove', apiMouseMoveHandler);",
        "    document.addEventListener('mouseup', apiMouseUpHandler);",
        "}",

        "function showApiInstructions() {",
        "    const notification = document.createElement('div');",
        "    notification.id = 'dima-api-notification';",
        "    notification.innerHTML = `",
        "        <div id='dima-api-notification-header'>",
        "            <div id='dima-api-notification-title'>🚀 How to Get Your FREE AI API Key</div>",
        "            <button id='dima-api-notification-close'>✕</button>",
        "        </div>",
        "        <div id='dima-api-notification-content'>",
        "            <div style='background: linear-gradient(135deg, #e06c75, #d63384); color: white; padding: 18px; border-radius: 12px; margin-bottom: 20px; font-weight: bold; text-align: center; box-shadow: 0 8px 25px rgba(224, 108, 117, 0.3); border: 1px solid rgba(255, 255, 255, 0.1);'>",
        "                🎉 RECOMMENDED: Groq offers completely FREE API access with fast AI models!",
        "            </div>",
        "            <h3>🆓 Free AI Providers (Recommended):</h3>",
        "            <ul>",
        "                <li><strong>🚀 Groq (100% FREE):</strong> Visit <a href='https://console.groq.com/keys' target='_blank' style='color: #e06c75; text-decoration: none; font-weight: 600;'>console.groq.com/keys</a>",
        "                    <br><span style='color: #f0808a; font-size: 0.9em; font-weight: 600;'>✅ Completely free, fast responses, no credit card required!</span></li>",
        "                <li><strong>🤖 Hugging Face:</strong> Visit <a href='https://huggingface.co/settings/tokens' target='_blank' style='color: #e06c75; text-decoration: none; font-weight: 600;'>huggingface.co/settings/tokens</a>",
        "                    <br><span style='color: #f0808a; font-size: 0.9em; font-weight: 600;'>✅ Free tier available</span></li>",
        "            </ul>",
        "            <h3>💰 Paid Providers (High Quality):</h3>",
        "            <ul>",
        "                <li><strong>OpenAI:</strong> Visit <a href='https://platform.openai.com/api-keys' target='_blank' style='color: #e06c75; text-decoration: none; font-weight: 600;'>platform.openai.com/api-keys</a>",
        "                    <br><span style='color: #ff6b6b; font-size: 0.9em; font-weight: 600;'>💳 Requires payment after free trial</span></li>",
        "                <li><strong>Anthropic (Claude):</strong> Visit <a href='https://console.anthropic.com/' target='_blank' style='color: #e06c75; text-decoration: none; font-weight: 600;'>console.anthropic.com</a>",
        "                    <br><span style='color: #ff6b6b; font-size: 0.9em; font-weight: 600;'>💳 Requires payment after free trial</span></li>",
        "                <li><strong>Google AI:</strong> Visit <a href='https://makersuite.google.com/app/apikey' target='_blank' style='color: #e06c75; text-decoration: none; font-weight: 600;'>makersuite.google.com/app/apikey</a>",
        "                    <br><span style='color: #ff6b6b; font-size: 0.9em; font-weight: 600;'>💳 May require payment for extended use</span></li>",
        "            </ul>",
        "            <h3>📝 Quick Setup Steps:</h3>",
        "            <ol>",
        "                <li><strong>Create an account</strong> with your chosen provider (we recommend Groq for free access)</li>",
        "                <li><strong>Navigate to API keys</strong> section in your dashboard</li>",
        "                <li><strong>Generate a new API key</strong> (some providers may require phone verification)</li>",
        "                <li><strong>Copy the key</strong> - it usually starts with <code>gsk_</code> (Groq), <code>sk-</code> (OpenAI), or <code>sk-ant-</code> (Anthropic)</li>",
        "                <li><strong>Paste it</strong> in the input field above and click Save!</li>",
        "            </ol>",
        "            <div style='background: rgba(224, 108, 117, 0.1); border: 2px solid #e06c75; border-radius: 12px; padding: 15px; margin-top: 20px; box-shadow: 0 4px 15px rgba(224, 108, 117, 0.2);'>",
        "                <h3 style='color: #e06c75; margin-top: 0; font-weight: 700;'>🔒 Privacy & Security:</h3>",
        "                <p style='margin-bottom: 0; font-size: 0.9em; line-height: 1.6;'>Your API key is stored locally in your browser and never sent to our servers. It's only used to communicate directly with your chosen AI provider.</p>",
        "            </div>",
        "        </div>",
        "    `;",
        "    document.body.appendChild(notification);",
        "    setTimeout(() => notification.classList.add('dima-visible'), 100);",

        "    const closeButton = notification.querySelector('#dima-api-notification-close');",
        "    if (closeButton) {",
        "        closeButton.onclick = function() {",
        "            notification.classList.remove('dima-visible');",
        "            setTimeout(() => {",
        "                if (notification.parentNode) notification.remove();",
        "            }, 300);",
        "        };",
        "    }",
        "}",
        "",



        "function drawMatrix() { if (!matrixCtx || !matrixCanvas) return; matrixCtx.fillStyle = 'rgba(0,0,0,0.05)'; matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height); matrixCtx.fillStyle = '#0F0'; matrixCtx.font = matrixFontSize + 'px monospace'; for (let i = 0; i < matrixDrops.length; i++) { const text = matrixChars[Math.floor(Math.random() * matrixChars.length)]; matrixCtx.fillText(text, i * matrixFontSize, matrixDrops[i] * matrixFontSize); if (matrixDrops[i] * matrixFontSize > matrixCanvas.height && Math.random() > 0.975) matrixDrops[i] = 0; matrixDrops[i]++; } }",

        "let elementRemoverActive = false;",
        "let textChangerActive = false;",
        "let glitchEffectActive = false;",
        "let rainbowTextActive = false;",
        "let shakeEffectActive = false;",
        "let invertColorsActive = false;",

        "function enableElementRemover() {",
        "    elementRemoverActive = true;",
        "    document.body.style.cursor = 'crosshair';",
        "    document.addEventListener('click', elementRemoverHandler);",
        "}",

        "function disableElementRemover() {",
        "    elementRemoverActive = false;",
        "    document.body.style.cursor = '';",
        "    document.removeEventListener('click', elementRemoverHandler);",
        "}",

        "function elementRemoverHandler(e) {",
        "    if (!elementRemoverActive) return;",
        "    e.preventDefault();",
        "    e.stopPropagation();",
        "    if (e.target && e.target !== document.body && e.target !== document.documentElement) {",
        "        e.target.style.display = 'none';",
        "    }",
        "}",

        "function enableTextChanger() {",
        "    textChangerActive = true;",
        "    document.body.style.cursor = 'text';",
        "    document.addEventListener('click', textChangerHandler);",
        "}",

        "function disableTextChanger() {",
        "    textChangerActive = false;",
        "    document.body.style.cursor = '';",
        "    document.removeEventListener('click', textChangerHandler);",
        "}",

        "function textChangerHandler(e) {",
        "    if (!textChangerActive) return;",
        "    e.preventDefault();",
        "    e.stopPropagation();",
        "    if (e.target && e.target.textContent) {",
        "        const newText = prompt('Enter new text:', e.target.textContent);",
        "        if (newText !== null) {",
        "            e.target.textContent = newText;",
        "        }",
        "    }",
        "}",

        "function enableGlitchEffect() {",
        "    glitchEffectActive = true;",
        "    const glitchStyle = document.createElement('style');",
        "    glitchStyle.id = 'dima-glitch-style';",
        "    glitchStyle.textContent = `",
        "        @keyframes dima-glitch {",
        "            0% { transform: translate(0); }",
        "            20% { transform: translate(-2px, 2px); }",
        "            40% { transform: translate(-2px, -2px); }",
        "            60% { transform: translate(2px, 2px); }",
        "            80% { transform: translate(2px, -2px); }",
        "            100% { transform: translate(0); }",
        "        }",
        "        body { animation: dima-glitch 0.1s infinite; }",
        "    `;",
        "    document.head.appendChild(glitchStyle);",
        "}",

        "function disableGlitchEffect() {",
        "    glitchEffectActive = false;",
        "    const glitchStyle = document.getElementById('dima-glitch-style');",
        "    if (glitchStyle) {",
        "        glitchStyle.remove();",
        "    }",
        "}",

        "function enableRainbowText() {",
        "    rainbowTextActive = true;",
        "    const rainbowStyle = document.createElement('style');",
        "    rainbowStyle.id = 'dima-rainbow-style';",
        "    rainbowStyle.textContent = `",
        "        @keyframes dima-rainbow {",
        "            0% { color: red; }",
        "            16.66% { color: orange; }",
        "            33.33% { color: yellow; }",
        "            50% { color: green; }",
        "            66.66% { color: blue; }",
        "            83.33% { color: indigo; }",
        "            100% { color: violet; }",
        "        }",
        "        body * { animation: dima-rainbow 2s infinite; }",
        "    `;",
        "    document.head.appendChild(rainbowStyle);",
        "}",

        "function disableRainbowText() {",
        "    rainbowTextActive = false;",
        "    const rainbowStyle = document.getElementById('dima-rainbow-style');",
        "    if (rainbowStyle) {",
        "        rainbowStyle.remove();",
        "    }",
        "}",

        "function enableShakeEffect() {",
        "    shakeEffectActive = true;",
        "    const shakeStyle = document.createElement('style');",
        "    shakeStyle.id = 'dima-shake-style';",
        "    shakeStyle.textContent = `",
        "        @keyframes dima-shake {",
        "            0%, 100% { transform: translateX(0); }",
        "            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }",
        "            20%, 40%, 60%, 80% { transform: translateX(5px); }",
        "        }",
        "        body { animation: dima-shake 0.5s infinite; }",
        "    `;",
        "    document.head.appendChild(shakeStyle);",
        "}",

        "function disableShakeEffect() {",
        "    shakeEffectActive = false;",
        "    const shakeStyle = document.getElementById('dima-shake-style');",
        "    if (shakeStyle) {",
        "        shakeStyle.remove();",
        "    }",
        "}",

        "function enableInvertColors() {",
        "    invertColorsActive = true;",
        "    const invertStyle = document.createElement('style');",
        "    invertStyle.id = 'dima-invert-style';",
        "    invertStyle.textContent = `",
        "        body { filter: invert(1); }",
        "    `;",
        "    document.head.appendChild(invertStyle);",
        "}",

        "function disableInvertColors() {",
        "    invertColorsActive = false;",
        "    const invertStyle = document.getElementById('dima-invert-style');",
        "    if (invertStyle) {",
        "        invertStyle.remove();",
        "    }",
        "}",

        "let imageReplacerActive = false;",
        "let styleInjectorActive = false;",
        "let fontChangerActive = false;",
        "let blurEffectActive = false;",
        "let pageInfoActive = false;",
        "let elementCounterActive = false;",
        "let antiDetectionActive = false;",
        "let scriptBlockerActive = false;",
        "let adBlockerActive = false;",
        "let confettiActive = false;",
        "let cursorTrailsActive = false;",
        "let pageShakeActive = false;",
        "let textScramblerActive = false;",

        "function enableImageReplacer() {",
        "    imageReplacerActive = true;",
        "    document.body.style.cursor = 'crosshair';",
        "    document.addEventListener('click', imageReplacerHandler);",
        "}",

        "function disableImageReplacer() {",
        "    imageReplacerActive = false;",
        "    document.body.style.cursor = '';",
        "    document.removeEventListener('click', imageReplacerHandler);",
        "}",

        "function imageReplacerHandler(e) {",
        "    if (!imageReplacerActive) return;",
        "    e.preventDefault();",
        "    e.stopPropagation();",
        "    if (e.target && e.target.tagName === 'IMG') {",
        "        const newImageUrl = prompt('Enter new image URL:', e.target.src);",
        "        if (newImageUrl) {",
        "            e.target.src = newImageUrl;",
        "        }",
        "    }",
        "}",

        "function enableStyleInjector() {",
        "    styleInjectorActive = true;",
        "    const css = prompt('Enter CSS to inject:');",
        "    if (css) {",
        "        const style = document.createElement('style');",
        "        style.id = 'dima-injected-style';",
        "        style.textContent = css;",
        "        document.head.appendChild(style);",
        "    }",
        "    const styleInjectorToggle = document.getElementById('dima-toggle-styleinjector');",
        "    if (styleInjectorToggle) styleInjectorToggle.checked = false;",
        "}",

        "function disableStyleInjector() {",
        "    styleInjectorActive = false;",
        "    const style = document.getElementById('dima-injected-style');",
        "    if (style) {",
        "        style.remove();",
        "    }",
        "}",

        "function enableFontChanger() {",
        "    fontChangerActive = true;",
        "    const font = prompt('Enter font family (e.g., Arial, Comic Sans):', 'Comic Sans MS');",
        "    if (font) {",
        "        const fontStyle = document.createElement('style');",
        "        fontStyle.id = 'dima-font-style';",
        "        fontStyle.textContent = `* { font-family: '${font}', sans-serif !important; }`;",
        "        document.head.appendChild(fontStyle);",
        "    }",
        "    const fontChangerToggle = document.getElementById('dima-toggle-fontchanger');",
        "    if (fontChangerToggle) fontChangerToggle.checked = false;",
        "}",

        "function disableFontChanger() {",
        "    fontChangerActive = false;",
        "    const fontStyle = document.getElementById('dima-font-style');",
        "    if (fontStyle) {",
        "        fontStyle.remove();",
        "    }",
        "}",

        "function enableBlurEffect() {",
        "    blurEffectActive = true;",
        "    const blurStyle = document.createElement('style');",
        "    blurStyle.id = 'dima-blur-style';",
        "    blurStyle.textContent = 'body { filter: blur(5px); }';",
        "    document.head.appendChild(blurStyle);",
        "}",

        "function disableBlurEffect() {",
        "    blurEffectActive = false;",
        "    const blurStyle = document.getElementById('dima-blur-style');",
        "    if (blurStyle) {",
        "        blurStyle.remove();",
        "    }",
        "}",

        "function showPageInfo() {",
        "    pageInfoActive = true;",
        "    const info = `Title: ${document.title}\\nURL: ${window.location.href}\\nElements: ${document.querySelectorAll('*').length}\\nImages: ${document.querySelectorAll('img').length}\\nLinks: ${document.querySelectorAll('a').length}`;",
        "    alert(info);",
        "    const pageInfoToggle = document.getElementById('dima-toggle-pageinfo');",
        "    if (pageInfoToggle) pageInfoToggle.checked = false;",
        "}",

        "function hidePageInfo() {",
        "    pageInfoActive = false;",
        "}",

        "function showElementCounter() {",
        "    elementCounterActive = true;",
        "    const elements = document.querySelectorAll('*');",
        "    const counts = {};",
        "    elements.forEach(el => {",
        "        const tag = el.tagName.toLowerCase();",
        "        counts[tag] = (counts[tag] || 0) + 1;",
        "    });",
        "    let result = 'Element Count:\\n';",
        "    Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([tag, count]) => {",
        "        result += `${tag}: ${count}\\n`;",
        "    });",
        "    alert(result);",
        "    const elementCounterToggle = document.getElementById('dima-toggle-elementcounter');",
        "    if (elementCounterToggle) elementCounterToggle.checked = false;",
        "}",

        "function hideElementCounter() {",
        "    elementCounterActive = false;",
        "}",

        "function extractLinks() {",
        "    const links = Array.from(document.querySelectorAll('a')).map(a => a.href);",
        "    const uniqueLinks = [...new Set(links)];",
        "    const result = uniqueLinks.join('\\n');",
        "    const textarea = document.createElement('textarea');",
        "    textarea.value = result;",
        "    document.body.appendChild(textarea);",
        "    textarea.select();",
        "    document.execCommand('copy');",
        "    document.body.removeChild(textarea);",
        "    alert(`Extracted ${uniqueLinks.length} unique links to clipboard!`);",
        "    const linkExtractorToggle = document.getElementById('dima-toggle-linkextractor');",
        "    if (linkExtractorToggle) linkExtractorToggle.checked = false;",
        "}",

        "function downloadAllImages() {",
        "    const images = document.querySelectorAll('img');",
        "    images.forEach((img, index) => {",
        "        if (img.src) {",
        "            const link = document.createElement('a');",
        "            link.href = img.src;",
        "            link.download = `image_${index}.jpg`;",
        "            link.click();",
        "        }",
        "    });",
        "    alert(`Downloaded ${images.length} images!`);",
        "    const imageDownloaderToggle = document.getElementById('dima-toggle-imagedownloader');",
        "    if (imageDownloaderToggle) imageDownloaderToggle.checked = false;",
        "}",

        "function enableAntiDetection() {",
        "    antiDetectionActive = true;",
        "    Object.defineProperty(navigator, 'webdriver', { get: () => false });",
        "    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });",
        "    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });",
        "    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;",
        "    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;",
        "    delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;",
        "}",

        "function disableAntiDetection() {",
        "    antiDetectionActive = false;",
        "}",

        "function enableScriptBlocker() {",
        "    scriptBlockerActive = true;",
        "    const originalCreateElement = document.createElement;",
        "    document.createElement = function(tagName) {",
        "        const element = originalCreateElement.call(document, tagName);",
        "        if (tagName.toLowerCase() === 'script') {",
        "            element.setAttribute('data-blocked', 'true');",
        "        }",
        "        return element;",
        "    };",
        "}",

        "function disableScriptBlocker() {",
        "    scriptBlockerActive = false;",
        "}",

        "function enableAdBlocker() {",
        "    adBlockerActive = true;",
        "    const adSelectors = ['[class*=\"ad\"]', '[id*=\"ad\"]', '[class*=\"ads\"]', '[id*=\"ads\"]', '[class*=\"advertisement\"]', '[id*=\"advertisement\"]'];",
        "    adSelectors.forEach(selector => {",
        "        document.querySelectorAll(selector).forEach(el => {",
        "            el.style.display = 'none';",
        "        });",
        "    });",
        "}",

        "function disableAdBlocker() {",
        "    adBlockerActive = false;",
        "}",

        "function enableConfetti() {",
        "    confettiActive = true;",
        "    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];",
        "    const confettiInterval = setInterval(() => {",
        "        if (!confettiActive) {",
        "            clearInterval(confettiInterval);",
        "            return;",
        "        }",
        "        const confetti = document.createElement('div');",
        "        confetti.style.position = 'fixed';",
        "        confetti.style.left = Math.random() * window.innerWidth + 'px';",
        "        confetti.style.top = '-10px';",
        "        confetti.style.width = '10px';",
        "        confetti.style.height = '10px';",
        "        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];",
        "        confetti.style.pointerEvents = 'none';",
        "        confetti.style.zIndex = '9999';",
        "        document.body.appendChild(confetti);",
        "        const animation = confetti.animate([",
        "            { transform: 'translateY(0px) rotate(0deg)', opacity: 1 },",
        "            { transform: `translateY(${window.innerHeight + 100}px) rotate(360deg)`, opacity: 0 }",
        "        ], {",
        "            duration: 3000,",
        "            easing: 'ease-out'",
        "        });",
        "        animation.onfinish = () => confetti.remove();",
        "    }, 100);",
        "}",

        "function disableConfetti() {",
        "    confettiActive = false;",
        "}",

        "function enableCursorTrails() {",
        "    cursorTrailsActive = true;",
        "    const trailElements = [];",
        "    document.addEventListener('mousemove', (e) => {",
        "        if (!cursorTrailsActive) return;",
        "        const trail = document.createElement('div');",
        "        trail.style.position = 'fixed';",
        "        trail.style.left = e.clientX + 'px';",
        "        trail.style.top = e.clientY + 'px';",
        "        trail.style.width = '4px';",
        "        trail.style.height = '4px';",
        "        trail.style.backgroundColor = '#ff0000';",
        "        trail.style.borderRadius = '50%';",
        "        trail.style.pointerEvents = 'none';",
        "        trail.style.zIndex = '9999';",
        "        document.body.appendChild(trail);",
        "        trailElements.push(trail);",
        "        setTimeout(() => {",
        "            trail.remove();",
        "            const index = trailElements.indexOf(trail);",
        "            if (index > -1) trailElements.splice(index, 1);",
        "        }, 1000);",
        "    });",
        "}",

        "function disableCursorTrails() {",
        "    cursorTrailsActive = false;",
        "}",

        "function enablePageShake() {",
        "    pageShakeActive = true;",
        "    const shakeStyle = document.createElement('style');",
        "    shakeStyle.id = 'dima-page-shake-style';",
        "    shakeStyle.textContent = `",
        "        @keyframes dima-page-shake {",
        "            0%, 100% { transform: translate(0, 0); }",
        "            10% { transform: translate(-10px, -10px); }",
        "            20% { transform: translate(10px, -10px); }",
        "            30% { transform: translate(-10px, 10px); }",
        "            40% { transform: translate(10px, 10px); }",
        "            50% { transform: translate(-5px, -5px); }",
        "            60% { transform: translate(5px, -5px); }",
        "            70% { transform: translate(-5px, 5px); }",
        "            80% { transform: translate(5px, 5px); }",
        "            90% { transform: translate(-2px, -2px); }",
        "        }",
        "        body { animation: dima-page-shake 0.5s infinite; }",
        "    `;",
        "    document.head.appendChild(shakeStyle);",
        "}",

        "function disablePageShake() {",
        "    pageShakeActive = false;",
        "    const shakeStyle = document.getElementById('dima-page-shake-style');",
        "    if (shakeStyle) {",
        "        shakeStyle.remove();",
        "    }",
        "}",

        "function enableTextScrambler() {",
        "    textScramblerActive = true;",
        "    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');",
        "    textElements.forEach(element => {",
        "        if (element.textContent && element.textContent.trim()) {",
        "            const originalText = element.textContent;",
        "            const scrambledText = originalText.split('').map(char => {",
        "                if (char === ' ') return ' ';",
        "                return String.fromCharCode(char.charCodeAt(0) + Math.floor(Math.random() * 10));",
        "            }).join('');",
        "            element.textContent = scrambledText;",
        "        }",
        "    });",
        "    const textScramblerToggle = document.getElementById('dima-toggle-textscrambler');",
        "    if (textScramblerToggle) textScramblerToggle.checked = false;",
        "}",

        "function disableTextScrambler() {",
        "    textScramblerActive = false;",
        "}",

        "let textHighlighterActive = false;",
        "let elementMoverActive = false;",
        "let colorPickerActive = false;",
        "let passwordRevealerActive = false;",
        "let formFillerActive = false;",
        "let threeDTransformActive = false;",
        "let particleSystemActive = false;",
        "let waveEffectActive = false;",
        "let neonGlowActive = false;",
        "let performanceMonitorActive = false;",

        "function enableTextHighlighter() {",
        "    textHighlighterActive = true;",
        "    document.body.style.cursor = 'text';",
        "    document.addEventListener('mouseup', textHighlighterHandler);",
        "}",

        "function disableTextHighlighter() {",
        "    textHighlighterActive = false;",
        "    document.body.style.cursor = '';",
        "    document.removeEventListener('mouseup', textHighlighterHandler);",
        "}",

        "function textHighlighterHandler() {",
        "    if (!textHighlighterActive) return;",
        "    const selection = window.getSelection();",
        "    if (selection.toString()) {",
        "        const range = selection.getRangeAt(0);",
        "        const span = document.createElement('span');",
        "        span.style.backgroundColor = 'yellow';",
        "        span.style.color = 'black';",
        "        range.surroundContents(span);",
        "    }",
        "}",

        "function enableElementMover() {",
        "    elementMoverActive = true;",
        "    document.body.style.cursor = 'move';",
        "    document.addEventListener('mousedown', elementMoverHandler);",
        "}",

        "function disableElementMover() {",
        "    elementMoverActive = false;",
        "    document.body.style.cursor = '';",
        "    document.removeEventListener('mousedown', elementMoverHandler);",
        "}",

        "function elementMoverHandler(e) {",
        "    if (!elementMoverActive) return;",
        "    e.preventDefault();",
        "    const element = e.target;",
        "    if (element && element !== document.body && element !== document.documentElement) {",
        "        element.style.position = 'relative';",
        "        element.style.zIndex = '9999';",
        "        const startX = e.clientX - element.offsetLeft;",
        "        const startY = e.clientY - element.offsetTop;",
        "        const moveHandler = (e) => {",
        "            element.style.left = (e.clientX - startX) + 'px';",
        "            element.style.top = (e.clientY - startY) + 'px';",
        "        };",
        "        const upHandler = () => {",
        "            document.removeEventListener('mousemove', moveHandler);",
        "            document.removeEventListener('mouseup', upHandler);",
        "        };",
        "        document.addEventListener('mousemove', moveHandler);",
        "        document.addEventListener('mouseup', upHandler);",
        "    }",
        "}",

        "function enableColorPicker() {",
        "    colorPickerActive = true;",
        "    document.body.style.cursor = 'crosshair';",
        "    document.addEventListener('click', colorPickerHandler);",
        "}",

        "function disableColorPicker() {",
        "    colorPickerActive = false;",
        "    document.body.style.cursor = '';",
        "    document.removeEventListener('click', colorPickerHandler);",
        "}",

        "function colorPickerHandler(e) {",
        "    if (!colorPickerActive) return;",
        "    e.preventDefault();",
        "    const element = e.target;",
        "    const color = getComputedStyle(element).backgroundColor;",
        "    alert(`Color: ${color}`);",
        "    const colorPickerToggle = document.getElementById('dima-toggle-colorpicker');",
        "    if (colorPickerToggle) colorPickerToggle.checked = false;",
        "}",

        "function takeScreenshot() {",
        "    html2canvas(document.body).then(canvas => {",
        "        const link = document.createElement('a');",
        "        link.download = 'screenshot.png';",
        "        link.href = canvas.toDataURL();",
        "        link.click();",
        "    });",
        "    const screenshotToggle = document.getElementById('dima-toggle-screenshot');",
        "    if (screenshotToggle) screenshotToggle.checked = false;",
        "}",

        "function showWordCounter() {",
        "    const text = document.body.innerText;",
        "    const words = text.split(/\\s+/).filter(word => word.length > 0);",
        "    const characters = text.length;",
        "    const lines = text.split('\\n').length;",
        "    alert(`Words: ${words.length}\\nCharacters: ${characters}\\nLines: ${lines}`);",
        "    const wordCounterToggle = document.getElementById('dima-toggle-wordcounter');",
        "    if (wordCounterToggle) wordCounterToggle.checked = false;",
        "}",

        "function enablePasswordRevealer() {",
        "    passwordRevealerActive = true;",
        "    const passwordFields = document.querySelectorAll('input[type=\"password\"]');",
        "    passwordFields.forEach(field => {",
        "        field.type = 'text';",
        "        field.style.backgroundColor = 'yellow';",
        "    });",
        "}",

        "function disablePasswordRevealer() {",
        "    passwordRevealerActive = false;",
        "    const passwordFields = document.querySelectorAll('input[type=\"text\"]');",
        "    passwordFields.forEach(field => {",
        "        if (field.style.backgroundColor === 'yellow') {",
        "            field.type = 'password';",
        "            field.style.backgroundColor = '';",
        "        }",
        "    });",
        "}",

        "function enableFormFiller() {",
        "    formFillerActive = true;",
        "    const inputs = document.querySelectorAll('input[type=\"text\"], input[type=\"email\"], textarea');",
        "    inputs.forEach(input => {",
        "        if (!input.value) {",
        "            input.value = 'Filled by DimaClient';",
        "            input.style.backgroundColor = 'lightgreen';",
        "        }",
        "    });",
        "    const formFillerToggle = document.getElementById('dima-toggle-formfiller');",
        "    if (formFillerToggle) formFillerToggle.checked = false;",
        "}",

        "function disableFormFiller() {",
        "    formFillerActive = false;",
        "    const inputs = document.querySelectorAll('input, textarea');",
        "    inputs.forEach(input => {",
        "        if (input.style.backgroundColor === 'lightgreen') {",
        "            input.style.backgroundColor = '';",
        "        }",
        "    });",
        "}",

        "function showCookieManager() {",
        "    const cookies = document.cookie.split(';').map(cookie => cookie.trim());",
        "    const cookieList = cookies.join('\\n');",
        "    alert(`Cookies:\\n${cookieList || 'No cookies found'}`);",
        "    const cookieManagerToggle = document.getElementById('dima-toggle-cookiemanager');",
        "    if (cookieManagerToggle) cookieManagerToggle.checked = false;",
        "}",

        "function enable3DTransform() {",
        "    threeDTransformActive = true;",
        "    const transformStyle = document.createElement('style');",
        "    transformStyle.id = 'dima-3d-transform-style';",
        "    transformStyle.textContent = `",
        "        body { perspective: 1000px; }",
        "        * { transform-style: preserve-3d; }",
        "        body:hover { transform: rotateY(10deg) rotateX(5deg); }",
        "    `;",
        "    document.head.appendChild(transformStyle);",
        "}",

        "function disable3DTransform() {",
        "    threeDTransformActive = false;",
        "    const transformStyle = document.getElementById('dima-3d-transform-style');",
        "    if (transformStyle) {",
        "        transformStyle.remove();",
        "    }",
        "}",

        "function enableParticleSystem() {",
        "    particleSystemActive = true;",
        "    const particleInterval = setInterval(() => {",
        "        if (!particleSystemActive) {",
        "            clearInterval(particleInterval);",
        "            return;",
        "        }",
        "        const particle = document.createElement('div');",
        "        particle.style.position = 'fixed';",
        "        particle.style.left = Math.random() * window.innerWidth + 'px';",
        "        particle.style.top = Math.random() * window.innerHeight + 'px';",
        "        particle.style.width = '4px';",
        "        particle.style.height = '4px';",
        "        particle.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;",
        "        particle.style.borderRadius = '50%';",
        "        particle.style.pointerEvents = 'none';",
        "        particle.style.zIndex = '9999';",
        "        document.body.appendChild(particle);",
        "        setTimeout(() => particle.remove(), 2000);",
        "    }, 100);",
        "}",

        "function disableParticleSystem() {",
        "    particleSystemActive = false;",
        "}",

        "function enableWaveEffect() {",
        "    waveEffectActive = true;",
        "    const waveStyle = document.createElement('style');",
        "    waveStyle.id = 'dima-wave-style';",
        "    waveStyle.textContent = `",
        "        @keyframes dima-wave {",
        "            0%, 100% { transform: translateY(0px); }",
        "            50% { transform: translateY(-10px); }",
        "        }",
        "        body * { animation: dima-wave 2s ease-in-out infinite; }",
        "    `;",
        "    document.head.appendChild(waveStyle);",
        "}",

        "function disableWaveEffect() {",
        "    waveEffectActive = false;",
        "    const waveStyle = document.getElementById('dima-wave-style');",
        "    if (waveStyle) {",
        "        waveStyle.remove();",
        "    }",
        "}",

        "function enableNeonGlow() {",
        "    neonGlowActive = true;",
        "    const neonStyle = document.createElement('style');",
        "    neonStyle.id = 'dima-neon-style';",
        "    neonStyle.textContent = `",
        "        body * { text-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 30px #ff00ff; }",
        "        a { box-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff; }",
        "        button { box-shadow: 0 0 10px #ffff00, 0 0 20px #ffff00; }",
        "    `;",
        "    document.head.appendChild(neonStyle);",
        "}",

        "function disableNeonGlow() {",
        "    neonGlowActive = false;",
        "    const neonStyle = document.getElementById('dima-neon-style');",
        "    if (neonStyle) {",
        "        neonStyle.remove();",
        "    }",
        "}",

        "function showMetaInspector() {",
        "    const metas = document.querySelectorAll('meta');",
        "    let metaInfo = 'Meta Tags:\\n';",
        "    metas.forEach(meta => {",
        "        const name = meta.getAttribute('name') || meta.getAttribute('property') || 'unknown';",
        "        const content = meta.getAttribute('content') || 'no content';",
        "        metaInfo += `${name}: ${content}\\n`;",
        "    });",
        "    alert(metaInfo);",
        "    const metaInspectorToggle = document.getElementById('dima-toggle-metainspector');",
        "    if (metaInspectorToggle) metaInspectorToggle.checked = false;",
        "}",

        "function enablePerformanceMonitor() {",
        "    performanceMonitorActive = true;",
        "    const monitorInterval = setInterval(() => {",
        "        if (!performanceMonitorActive) {",
        "            clearInterval(monitorInterval);",
        "            return;",
        "        }",
        "        const memory = performance.memory;",
        "        const info = `Memory: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB / ${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`;",
        "    }, 5000);",
        "}",

        "function disablePerformanceMonitor() {",
        "    performanceMonitorActive = false;",
        "}",

        "function showNetworkInspector() {",
        "    const resources = performance.getEntriesByType('resource');",
        "    let networkInfo = 'Network Resources:\\n';",
        "    resources.slice(0, 10).forEach(resource => {",
        "        networkInfo += `${resource.name}\\n`;",
        "    });",
        "    alert(networkInfo);",
        "    const networkInspectorToggle = document.getElementById('dima-toggle-networkinspector');",
        "    if (networkInspectorToggle) networkInspectorToggle.checked = false;",
        "}",

        "function runSecurityScanner() {",
        "    const securityIssues = [];",
        "    const scripts = document.querySelectorAll('script');",
        "    const iframes = document.querySelectorAll('iframe');",
        "    const forms = document.querySelectorAll('form');",
        "    if (scripts.length > 10) securityIssues.push('Many scripts detected');",
        "    if (iframes.length > 0) securityIssues.push('Iframes detected');",
        "    if (forms.length > 0) securityIssues.push('Forms detected');",
        "    const result = securityIssues.length > 0 ? securityIssues.join('\\n') : 'No security issues detected';",
        "    alert(`Security Scan:\\n${result}`);",
        "    const securityScannerToggle = document.getElementById('dima-toggle-securityscanner');",
        "    if (securityScannerToggle) securityScannerToggle.checked = false;",
        "}",

        "window.getPageContext = function() {",
        "    const context = {",
        "        url: window.location.href,",
        "        title: document.title,",
        "        domain: window.location.hostname,",
        "        protocol: window.location.protocol,",
        "        elements: {",
        "            total: document.querySelectorAll('*').length,",
        "            links: document.querySelectorAll('a').length,",
        "            images: document.querySelectorAll('img').length,",
        "            forms: document.querySelectorAll('form').length,",
        "            inputs: document.querySelectorAll('input, textarea, select').length,",
        "            scripts: document.querySelectorAll('script').length,",
        "            styles: document.querySelectorAll('style, link[rel=\"stylesheet\"]').length",
        "        },",
        "        meta: {",
        "            description: document.querySelector('meta[name=\"description\"]')?.content || 'None',",
        "            keywords: document.querySelector('meta[name=\"keywords\"]')?.content || 'None',",
        "            viewport: document.querySelector('meta[name=\"viewport\"]')?.content || 'None'",
        "        },",
        "        security: {",
        "            hasHttps: window.location.protocol === 'https:',",
        "            hasCSP: !!document.querySelector('meta[http-equiv=\"Content-Security-Policy\"]'),",
        "            hasXFrame: !!document.querySelector('meta[http-equiv=\"X-Frame-Options\"]')",
        "        },",
        "        features: {",
        "            hasLocalStorage: !!window.localStorage,",
        "            hasSessionStorage: !!window.sessionStorage,",
        "            hasGeolocation: !!navigator.geolocation,",
        "            hasWebGL: !!window.WebGLRenderingContext",
        "        }",
        "    };",
        "    return JSON.stringify(context, null, 2);",
        "};",

        "window.analyzePageAndSuggestMods = function() {",
        "    const suggestions = [];",
        "    const context = JSON.parse(window.getPageContext());",
        "    ",
        "    if (context.elements.images > 0) {",
        "        suggestions.push('Image Replacer - Replace images with custom ones');",
        "        suggestions.push('Image Downloader - Download all images from the page');",
        "    }",
        "    ",
        "    if (context.elements.forms > 0) {",
        "        suggestions.push('Form Filler - Automatically fill form fields');",
        "        suggestions.push('Password Revealer - Show hidden password fields');",
        "    }",
        "    ",
        "    if (context.elements.links > 0) {",
        "        suggestions.push('Link Extractor - Extract all links from the page');",
        "    }",
        "    ",
        "    if (context.elements.scripts > 0) {",
        "        suggestions.push('Script Blocker - Block certain scripts from running');",
        "    }",
        "    ",
        "    if (!context.security.hasHttps) {",
        "        suggestions.push('Security Scanner - Check for security vulnerabilities');",
        "    }",
        "    ",
        "    if (context.elements.total > 100) {",
        "        suggestions.push('Element Counter - Count all elements on the page');",
        "        suggestions.push('Element Remover - Remove unwanted elements');",
        "    }",
        "    ",
        "    if (context.elements.inputs > 0) {",
        "        suggestions.push('Text Changer - Modify text content on the page');",
        "    }",
        "    ",
        "    suggestions.push('Page Info - Show detailed page information');",
        "    suggestions.push('Style Injector - Add custom CSS to the page');",
        "    suggestions.push('Font Changer - Change all fonts on the page');",
        "    ",
        "    return suggestions;",
        "};",

        "window.showSmartSuggestions = function() {",
        "    const suggestions = window.analyzePageAndSuggestMods();",
        "    const context = JSON.parse(window.getPageContext());",
        "    ",
        "    let message = `🤖 **Smart Analysis of Current Page**\\n\\n`;",
        "    message += `📄 **Page Info:**\\n`;",
        "    message += `• URL: ${context.url}\\n`;",
        "    message += `• Title: ${context.title}\\n`;",
        "    message += `• Domain: ${context.domain}\\n`;",
        "    message += `• Protocol: ${context.protocol}\\n\\n`;",
        "    ",
        "    message += `🔍 **Page Analysis:**\\n`;",
        "    message += `• Total Elements: ${context.elements.total}\\n`;",
        "    message += `• Links: ${context.elements.links}\\n`;",
        "    message += `• Images: ${context.elements.images}\\n`;",
        "    message += `• Forms: ${context.elements.forms}\\n`;",
        "    message += `• Input Fields: ${context.elements.inputs}\\n`;",
        "    message += `• Scripts: ${context.elements.scripts}\\n\\n`;",
        "    ",
        "    message += `🔒 **Security Status:**\\n`;",
        "    message += `• HTTPS: ${context.security.hasHttps ? '✅ Secure' : '❌ Not Secure'}\\n`;",
        "    message += `• CSP: ${context.security.hasCSP ? '✅ Present' : '❌ Missing'}\\n`;",
        "    message += `• X-Frame: ${context.security.hasXFrame ? '✅ Present' : '❌ Missing'}\\n\\n`;",
        "    ",
        "    message += `💡 **Recommended Mods:**\\n`;",
        "    suggestions.forEach((suggestion, index) => {",
        "        message += `${index + 1}. ${suggestion}\\n`;",
        "    });",
        "    ",
        "    message += `\\n🎯 **Quick Actions:**\\n`;",
        "    message += `• Ask me to enable any of these mods\\n`;",
        "    message += `• Request custom code for specific tasks\\n`;",
        "    message += `• Get detailed analysis of any element\\n`;",
        "    message += `• Learn how to use any feature\\n`;",
        "    ",
        "    window.addAiMessage('assistant', message);",
        "    window.aiConversationHistory.push({ role: 'assistant', content: message });",
        "};",

        "window.enableModWithConfirmation = function(modName, toggleId, enableFunction) {",
        "    window.trackUsage('mod_used');",
        "    const confirmed = confirm(`🤖 AI Assistant: Would you like me to enable the ${modName} mod for you?\\n\\nThis will activate the ${modName} feature immediately.\\n\\nClick OK to enable, or Cancel to skip.`);",
        "    if (confirmed) {",
        "        const toggle = document.getElementById(toggleId);",
        "        if (toggle) {",
        "            toggle.checked = true;",
        "            if (enableFunction && typeof window[enableFunction] === 'function') {",
        "                window[enableFunction]();",
        "            }",
        "            window.addAiMessage('assistant', `✅ **${modName} enabled successfully!**\\n\\nThe ${modName} mod is now active and ready to use.`);",
        "            window.aiConversationHistory.push({ role: 'assistant', content: `✅ ${modName} enabled successfully!` });",
        "        } else {",
        "            window.addAiMessage('assistant', `❌ **Error:** Could not find the ${modName} toggle. Please enable it manually.`);",
        "            window.aiConversationHistory.push({ role: 'assistant', content: `❌ Error: Could not find ${modName} toggle` });",
        "        }",
        "    } else {",
        "        window.addAiMessage('assistant', `⏭️ **Skipped:** ${modName} was not enabled. You can enable it manually anytime.`);",
        "        window.aiConversationHistory.push({ role: 'assistant', content: `⏭️ Skipped: ${modName} not enabled` });",
        "    }",
        "};",

        "window.handleModRequest = function(userMessage) {",
        "    const modMappings = {",
        "        'image replacer': { name: 'Image Replacer', toggleId: 'dima-toggle-imagereplacer', func: 'enableImageReplacer' },",
        "        'image downloader': { name: 'Image Downloader', toggleId: 'dima-toggle-imagedownloader', func: 'enableImageDownloader' },",
        "        'form filler': { name: 'Form Filler', toggleId: 'dima-toggle-formfiller', func: 'enableFormFiller' },",
        "        'password revealer': { name: 'Password Revealer', toggleId: 'dima-toggle-passwordrevealer', func: 'enablePasswordRevealer' },",
        "        'link extractor': { name: 'Link Extractor', toggleId: 'dima-toggle-linkextractor', func: 'enableLinkExtractor' },",
        "        'script blocker': { name: 'Script Blocker', toggleId: 'dima-toggle-scriptblocker', func: 'enableScriptBlocker' },",
        "        'security scanner': { name: 'Security Scanner', toggleId: 'dima-toggle-securityscanner', func: 'runSecurityScanner' },",
        "        'element counter': { name: 'Element Counter', toggleId: 'dima-toggle-elementcounter', func: 'enableElementCounter' },",
        "        'element remover': { name: 'Element Remover', toggleId: 'dima-toggle-elementremover', func: 'enableElementRemover' },",
        "        'text changer': { name: 'Text Changer', toggleId: 'dima-toggle-textchanger', func: 'enableTextChanger' },",
        "        'page info': { name: 'Page Info', toggleId: 'dima-toggle-pageinfo', func: 'enablePageInfo' },",
        "        'style injector': { name: 'Style Injector', toggleId: 'dima-toggle-styleinjector', func: 'enableStyleInjector' },",
        "        'font changer': { name: 'Font Changer', toggleId: 'dima-toggle-fontchanger', func: 'enableFontChanger' },",
        "        'blur effect': { name: 'Blur Effect', toggleId: 'dima-toggle-blureffect', func: 'enableBlurEffect' },",
        "        'anti detection': { name: 'Anti-Detection', toggleId: 'dima-toggle-antidetection', func: 'enableAntiDetection' },",
        "        'ad blocker': { name: 'Ad Blocker', toggleId: 'dima-toggle-adblocker', func: 'enableAdBlocker' },",
        "        'confetti': { name: 'Confetti', toggleId: 'dima-toggle-confetti', func: 'enableConfetti' },",
        "        'cursor trails': { name: 'Cursor Trails', toggleId: 'dima-toggle-cursortrails', func: 'enableCursorTrails' },",
        "        'page shake': { name: 'Page Shake', toggleId: 'dima-toggle-pageshake', func: 'enablePageShake' },",
        "        'text scrambler': { name: 'Text Scrambler', toggleId: 'dima-toggle-textscrambler', func: 'enableTextScrambler' },",
        "        'text highlighter': { name: 'Text Highlighter', toggleId: 'dima-toggle-texthighlighter', func: 'enableTextHighlighter' },",
        "        'element mover': { name: 'Element Mover', toggleId: 'dima-toggle-elementmover', func: 'enableElementMover' },",
        "        'color picker': { name: 'Color Picker', toggleId: 'dima-toggle-colorpicker', func: 'enableColorPicker' },",
        "        'screenshot tool': { name: 'Screenshot Tool', toggleId: 'dima-toggle-screenshottool', func: 'enableScreenshotTool' },",
        "        'word counter': { name: 'Word Counter', toggleId: 'dima-toggle-wordcounter', func: 'enableWordCounter' },",
        "        'cookie manager': { name: 'Cookie Manager', toggleId: 'dima-toggle-cookiemanager', func: 'enableCookieManager' },",
        "        '3d transform': { name: '3D Transform', toggleId: 'dima-toggle-3dtransform', func: 'enable3DTransform' },",
        "        'particle system': { name: 'Particle System', toggleId: 'dima-toggle-particlesystem', func: 'enableParticleSystem' },",
        "        'wave effect': { name: 'Wave Effect', toggleId: 'dima-toggle-waveeffect', func: 'enableWaveEffect' },",
        "        'neon glow': { name: 'Neon Glow', toggleId: 'dima-toggle-neonglow', func: 'enableNeonGlow' },",
        "        'meta inspector': { name: 'Meta Inspector', toggleId: 'dima-toggle-metainspector', func: 'showMetaInspector' },",
        "        'performance monitor': { name: 'Performance Monitor', toggleId: 'dima-toggle-performancemonitor', func: 'enablePerformanceMonitor' },",
        "        'network inspector': { name: 'Network Inspector', toggleId: 'dima-toggle-networkinspector', func: 'showNetworkInspector' },",
        "        'glitch effect': { name: 'Glitch Effect', toggleId: 'dima-toggle-glitch', func: 'enableGlitchEffect' },",
        "        'rainbow text': { name: 'Rainbow Text', toggleId: 'dima-toggle-rainbowtext', func: 'enableRainbowText' },",
        "        'shake effect': { name: 'Shake Effect', toggleId: 'dima-toggle-shake', func: 'enableShakeEffect' },",
        "        'invert colors': { name: 'Invert Colors', toggleId: 'dima-toggle-invert', func: 'enableInvertColors' }",
        "    };",
        "    ",
        "    const lowerMessage = userMessage.toLowerCase();",
        "    for (const [key, mod] of Object.entries(modMappings)) {",
        "        if (lowerMessage.includes(key)) {",
        "            window.enableModWithConfirmation(mod.name, mod.toggleId, mod.func);",
        "            return true;",
        "        }",
        "    }",
        "    return false;",
        "};",

        "window.sendAiMessage = async function() {",
        "    const message = window.aiInput.value.trim();",
        "    if (!message) return;",
        "    window.addAiMessage('user', message);",
        "    window.aiInput.value = '';",
        "    window.aiSendButton.disabled = true;",
        "    window.aiSendButton.textContent = 'Sending...';",
        "    window.aiConversationHistory.push({ role: 'user', content: message });",
        "    window.trackUsage('message');",
        "    ",
        "    const modRequestHandled = window.handleModRequest(message);",
        "    if (modRequestHandled) {",
        "        window.aiSendButton.disabled = false;",
        "        window.aiSendButton.textContent = 'Send';",
        "        return;",
        "    }",
        "    ",
        "    const typingIndicator = window.showTypingIndicator();",
        "    ",
        "    try {",
        "        const pageContext = window.getPageContext();",
        "        const contextMessage = `Current Page Context:\\n${pageContext}`;",
        "        const messages = [{",
        "            role: 'system',",
        "            content: 'You are an advanced AI assistant integrated into the 9Shadows Client, a sophisticated browser-based tool with extensive mods and utilities. You are highly knowledgeable about web technologies, programming languages, cybersecurity, browser automation, and development tools. You can help with complex coding problems, debug issues, explain advanced concepts, provide detailed code examples, and guide users through the client\\'s powerful features. You understand JavaScript, CSS, HTML, Python, Node.js, web APIs, browser extensions, DOM manipulation, network protocols, security practices, and modern web development frameworks. You can analyze code, suggest optimizations, explain technical concepts clearly, and provide step-by-step solutions. You are also knowledgeable about browser security, web scraping, automation, and ethical hacking concepts. Always provide accurate, detailed, and practical answers while maintaining security awareness. When generating code, always format it properly with appropriate syntax highlighting and make it easily copyable. Be friendly, patient, and helpful. Explain complex concepts in simple terms when needed. If a user asks for code generation, provide clean, well-commented, and production-ready code that they can immediately use. You have access to real-time page context including the current URL, page title, DOM structure, and available elements. Use this context to provide more relevant and specific assistance. When analyzing pages, consider security implications and suggest appropriate mods from the client\\'s extensive feature set. You can also enable mods directly when users ask for them - just mention that you can enable any mod they request.'",
        "        }, {",
        "            role: 'user',",
        "            content: contextMessage",
        "        }, ...window.aiConversationHistory];",
        "        const apiKey = window.GROQ_API_KEY;",
        "        if (!apiKey) {",
        "            window.addAiMessage('assistant', '❌ **API Key Required**\\n\\nPlease set up your API key first by clicking the Setup API Key button.');",
        "            return;",
        "        }",
        "        ",
        "        let apiUrl, model;",
        "        if (apiKey.startsWith('gsk_')) {",
        "            apiUrl = 'https://api.groq.com/openai/v1/chat/completions';",
        "            model = 'llama3-8b-8192';",
        "        } else if (apiKey.startsWith('sk-')) {",
        "            apiUrl = 'https://api.openai.com/v1/chat/completions';",
        "            model = 'gpt-3.5-turbo';",
        "        } else if (apiKey.startsWith('sk-ant-')) {",
        "            apiUrl = 'https://api.anthropic.com/v1/messages';",
        "            model = 'claude-3-haiku-20240307';",
        "        } else {",
        "            apiUrl = 'https://api.groq.com/openai/v1/chat/completions';",
        "            model = 'llama3-8b-8192';",
        "        }",
        "        ",
        "        const requestBody = apiKey.startsWith('sk-ant-') ? {",
        "            model: model,",
        "            max_tokens: 2000,",
        "            messages: messages",
        "        } : {",
        "            model: model,",
        "            messages: messages,",
        "            temperature: 0.7,",
        "            max_tokens: 2000",
        "        };",
        "        ",
        "        const response = await fetch(apiUrl, {",
        "            method: 'POST',",
        "            headers: {",
        "                'Authorization': `Bearer ${apiKey}`,",
        "                'Content-Type': 'application/json'",
        "            },",
        "            body: JSON.stringify(requestBody)",
        "        });",
        "        const data = await response.json();",
        "        window.hideTypingIndicator(typingIndicator);",
        "        if (data.choices && data.choices[0]) {",
        "            const aiResponse = data.choices[0].message.content;",
        "            window.lastAiResponse = aiResponse;",
        "            window.aiConversationHistory.push({ role: 'assistant', content: aiResponse });",
        "            window.addAiMessage('assistant', aiResponse);",
        "            window.trackUsage('ai_response');",
        "            ",
        "            if (window.aiConversationHistory.length === 2) {",
        "                setTimeout(() => window.addQuickActions(), 500);",
        "            }",
        "        } else {",
        "            window.addAiMessage('assistant', 'Sorry, I encountered an error. Please try again.');",
        "        }",
        "    } catch (error) {",
        "        window.hideTypingIndicator(typingIndicator);",
        "        window.addAiMessage('assistant', 'Sorry, I encountered an error. Please try again.');",
        "    } finally {",
        "        window.aiSendButton.disabled = false;",
        "        window.aiSendButton.textContent = 'Send';",
        "    }",
        "};",

        "window.addAiMessage = function(role, content, showTimestamp = true) {",
        "    const messageDiv = document.createElement('div');",
        "    messageDiv.className = `dima-ai-message dima-ai-${role}`;",
        "    ",
        "    const avatar = document.createElement('div');",
        "    avatar.className = 'dima-ai-avatar';",
        "    avatar.textContent = role === 'user' ? '👤' : '🤖';",
        "    ",
        "    const textDiv = document.createElement('div');",
        "    textDiv.className = 'dima-ai-text';",
        "    textDiv.innerHTML = formatAiMessage(content);",
        "    ",
        "    const timestampDiv = document.createElement('div');",
        "    timestampDiv.className = 'dima-ai-timestamp';",
        "    timestampDiv.textContent = new Date().toLocaleTimeString();",
        "    ",
        "    const reactionsDiv = document.createElement('div');",
        "    reactionsDiv.className = 'dima-ai-reactions';",
        "    if (role === 'assistant') {",
        "        const thumbsUp = document.createElement('button');",
        "        thumbsUp.className = 'dima-ai-reaction-btn';",
        "        thumbsUp.innerHTML = '👍';",
        "        thumbsUp.onclick = () => window.handleReaction(messageDiv, '👍');",
        "        ",
        "        const thumbsDown = document.createElement('button');",
        "        thumbsDown.className = 'dima-ai-reaction-btn';",
        "        thumbsDown.innerHTML = '👎';",
        "        thumbsDown.onclick = () => window.handleReaction(messageDiv, '👎');",
        "        ",
        "        reactionsDiv.appendChild(thumbsUp);",
        "        reactionsDiv.appendChild(thumbsDown);",
        "    }",
        "    ",
        "    messageDiv.appendChild(avatar);",
        "    messageDiv.appendChild(textDiv);",
        "    if (showTimestamp) messageDiv.appendChild(timestampDiv);",
        "    if (role === 'assistant') messageDiv.appendChild(reactionsDiv);",
        "    ",
        "    window.aiChat.appendChild(messageDiv);",
        "    window.aiChat.scrollTop = window.aiChat.scrollHeight;",
        "    return messageDiv;",
        "};",

        "window.showTypingIndicator = function() {",
        "    const typingDiv = document.createElement('div');",
        "    typingDiv.className = 'dima-ai-message dima-ai-assistant dima-ai-typing';",
        "    typingDiv.innerHTML = `",
        "        <div class='dima-ai-avatar'>🤖</div>",
        "        <div class='dima-ai-text'>",
        "            <div class='dima-typing-indicator'>",
        "                <span></span><span></span><span></span>",
        "            </div>",
        "        </div>",
        "    `;",
        "    window.aiChat.appendChild(typingDiv);",
        "    window.aiChat.scrollTop = window.aiChat.scrollHeight;",
        "    return typingDiv;",
        "};",

        "window.hideTypingIndicator = function(typingDiv) {",
        "    if (typingDiv && typingDiv.parentNode) {",
        "        typingDiv.remove();",
        "    }",
        "};",

        "window.handleReaction = function(messageDiv, reaction) {",
        "    const reactionBtn = messageDiv.querySelector('.dima-ai-reaction-btn');",
        "    if (reactionBtn) {",
        "        reactionBtn.style.background = '#28a745';",
        "        reactionBtn.style.transform = 'scale(1.2)';",
        "        setTimeout(() => {",
        "            reactionBtn.style.background = '';",
        "            reactionBtn.style.transform = '';",
        "        }, 1000);",
        "    }",
        "    ",
        "    const feedback = reaction === '👍' ? 'positive' : 'negative';",
        "    window.addAiMessage('assistant', `Thank you for your ${feedback} feedback! I'll use this to improve my responses.`);",
        "};",

        "window.addQuickActions = function() {",
        "    const quickActionsDiv = document.createElement('div');",
        "    quickActionsDiv.className = 'dima-quick-actions';",
        "    quickActionsDiv.innerHTML = `",
        "        <div class='dima-quick-actions-title'>Quick Actions:</div>",
        "        <div class='dima-quick-actions-grid'>",
        "            <button onclick='window.showSmartSuggestions()'>📊 Smart Analysis</button>",
        "            <button onclick='window.enableModWithConfirmation(\\\"Security Scanner\\\", \\\"dima-toggle-securityscanner\\\", \\\"runSecurityScanner\\\")'>🔒 Security Scan</button>",
        "            <button onclick='window.enableModWithConfirmation(\\\"Page Info\\\", \\\"dima-toggle-pageinfo\\\", \\\"enablePageInfo\\\")'>📄 Page Info</button>",
        "            <button onclick='window.enableModWithConfirmation(\\\"Element Counter\\\", \\\"dima-toggle-elementcounter\\\", \\\"enableElementCounter\\\")'>🔢 Count Elements</button>",
        "            <button onclick='window.enableModWithConfirmation(\\\"Image Downloader\\\", \\\"dima-toggle-imagedownloader\\\", \\\"enableImageDownloader\\\")'>📸 Download Images</button>",
        "            <button onclick='window.enableModWithConfirmation(\\\"Link Extractor\\\", \\\"dima-toggle-linkextractor\\\", \\\"enableLinkExtractor\\\")'>🔗 Extract Links</button>",
        "        </div>",
        "    `;",
        "    window.aiChat.appendChild(quickActionsDiv);",
        "    window.aiChat.scrollTop = window.aiChat.scrollHeight;",
        "};",

        "window.startVoiceInput = function() {",
        "    window.trackUsage('voice_input');",
        "    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {",
        "        window.addAiMessage('assistant', '❌ **Voice input not supported**\\n\\nYour browser does not support speech recognition. Please use text input instead.');",
        "        return;",
        "    }",
        "    ",
        "    const voiceButton = document.getElementById('dima-ai-voice');",
        "    voiceButton.classList.add('recording');",
        "    voiceButton.textContent = '🔴 Recording...';",
        "    ",
        "    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;",
        "    const recognition = new SpeechRecognition();",
        "    recognition.continuous = false;",
        "    recognition.interimResults = false;",
        "    recognition.lang = 'en-US';",
        "    ",
        "    recognition.onstart = function() {",
        "        window.addAiMessage('assistant', '🎤 **Listening...**\\n\\nSpeak your message now.');",
        "    };",
        "    ",
        "    recognition.onresult = function(event) {",
        "        const transcript = event.results[0][0].transcript;",
        "        window.aiInput.value = transcript;",
        "        window.sendAiMessage();",
        "    };",
        "    ",
        "    recognition.onerror = function(event) {",
        "        window.addAiMessage('assistant', '❌ **Voice input error:** ' + event.error);",
        "    };",
        "    ",
        "    recognition.onend = function() {",
        "        voiceButton.classList.remove('recording');",
        "        voiceButton.textContent = '🎤 Voice';",
        "    };",
        "    ",
        "    recognition.start();",
        "};",

        "window.handleFileUpload = function(file) {",
        "    window.trackUsage('file_upload');",
        "    const reader = new FileReader();",
        "    reader.onload = function(e) {",
        "        const content = e.target.result;",
        "        const fileName = file.name;",
        "        const fileSize = (file.size / 1024).toFixed(2) + ' KB';",
        "        ",
        "        let preview = `📁 **File Uploaded:** ${fileName} (${fileSize})\\n\\n`;",
        "        ",
        "        if (file.type.startsWith('image/')) {",
        "            preview += `![${fileName}](data:${file.type};base64,${btoa(content)})\\n\\n`;",
        "            preview += `**Image Analysis:**\\nThis appears to be an image file. I can help you analyze its content, extract text, or provide insights about what I can see.`;",
        "        } else {",
        "            preview += `**File Content:**\\n\\`\\`\\`${getFileExtension(fileName)}\\n${content.substring(0, 1000)}${content.length > 1000 ? '...' : ''}\\n\\`\\`\\``;",
        "        }",
        "        ",
        "        window.addAiMessage('user', `📁 Uploaded: ${fileName}`);",
        "        window.addAiMessage('assistant', preview);",
        "        ",
        "        const contextMessage = `User uploaded file: ${fileName}\\nFile type: ${file.type}\\nFile size: ${fileSize}\\nContent: ${content.substring(0, 2000)}`;",
        "        window.aiConversationHistory.push({ role: 'user', content: contextMessage });",
        "    };",
        "    ",
        "    if (file.type.startsWith('image/')) {",
        "        reader.readAsDataURL(file);",
        "    } else {",
        "        reader.readAsText(file);",
        "    }",
        "};",

        "window.getFileExtension = function(filename) {",
        "    const ext = filename.split('.').pop().toLowerCase();",
        "    const extensions = {",
        "        'js': 'javascript',",
        "        'html': 'html',",
        "        'css': 'css',",
        "        'json': 'json',",
        "        'txt': 'text',",
        "        'py': 'python',",
        "        'php': 'php',",
        "        'java': 'java',",
        "        'cpp': 'cpp',",
        "        'c': 'c'",
        "    };",
        "    return extensions[ext] || 'text';",
        "};",

        "window.handleScreenshotUpload = function(file) {",
        "    const reader = new FileReader();",
        "    reader.onload = function(e) {",
        "        const imageData = e.target.result;",
        "        const fileName = file.name;",
        "        const fileSize = (file.size / 1024).toFixed(2) + ' KB';",
        "        ",
        "        const preview = `📸 **Screenshot Analysis:** ${fileName} (${fileSize})\\n\\n![Screenshot](${imageData})\\n\\n**What I can analyze:**\\n• Visual elements and layout\\n• Text content (if readable)\\n• UI components and design\\n• Color schemes and styling\\n• Potential issues or improvements\\n\\nAsk me to analyze specific aspects of this screenshot!`;",
        "        ",
        "        window.addAiMessage('user', `📸 Screenshot: ${fileName}`);",
        "        window.addAiMessage('assistant', preview);",
        "        ",
        "        const contextMessage = `User uploaded screenshot: ${fileName}\\nFile type: ${file.type}\\nFile size: ${fileSize}\\nThis is an image file for visual analysis.`;",
        "        window.aiConversationHistory.push({ role: 'user', content: contextMessage });",
        "    };",
        "    reader.readAsDataURL(file);",
        "};",

        "window.exportConversation = function() {",
        "    window.trackUsage('export');",
        "    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);",
        "    const filename = `ai-conversation-${timestamp}.txt`;",
        "    ",
        "    let exportContent = `9Shadows Client - AI Conversation Export\\nGenerated: ${new Date().toLocaleString()}\\n\\n`;",
        "    ",
        "    const messages = window.aiChat.querySelectorAll('.dima-ai-message');",
        "    messages.forEach((msg, index) => {",
        "        const role = msg.classList.contains('dima-ai-user') ? 'User' : 'AI Assistant';",
        "        const text = msg.querySelector('.dima-ai-text')?.textContent || '';",
        "        const timestamp = msg.querySelector('.dima-ai-timestamp')?.textContent || '';",
        "        ",
        "        exportContent += `[${timestamp}] ${role}:\\n${text}\\n\\n`;",
        "    });",
        "    ",
        "    const blob = new Blob([exportContent], { type: 'text/plain' });",
        "    const url = URL.createObjectURL(blob);",
        "    const a = document.createElement('a');",
        "    a.href = url;",
        "    a.download = filename;",
        "    document.body.appendChild(a);",
        "    a.click();",
        "    document.body.removeChild(a);",
        "    URL.revokeObjectURL(url);",
        "    ",
        "    window.addAiMessage('assistant', `💾 **Conversation exported successfully!**\\n\\nFile: ${filename}\\n\\nThe conversation has been saved to your downloads folder.`);",
        "};",

        "window.showAnalytics = function() {",
        "    if (!window.usageStats) {",
        "        window.usageStats = {",
        "            messagesSent: 0,",
        "            modsUsed: 0,",
        "            featuresUsed: 0,",
        "            sessionStart: new Date(),",
        "            aiResponses: 0,",
        "            voiceInputs: 0,",
        "            fileUploads: 0,",
        "            exports: 0",
        "        };",
        "    }",
        "    ",
        "    const sessionDuration = Math.floor((new Date() - window.usageStats.sessionStart) / 1000 / 60);",
        "    const responseQuality = window.usageStats.aiResponses > 0 ? 'Good' : 'No data yet';",
        "    ",
        "    const analyticsHTML = `",
        "        <div class='dima-analytics-panel'>",
        "            <div class='dima-analytics-section'>",
        "                <div class='dima-analytics-title'>📊 Usage Insights</div>",
        "                <div class='dima-analytics-item'>",
        "                    <span>Messages Sent:</span>",
        "                    <span class='dima-analytics-value'>${window.usageStats.messagesSent}</span>",
        "                </div>",
        "                <div class='dima-analytics-item'>",
        "                    <span>Session Duration:</span>",
        "                    <span class='dima-analytics-value'>${sessionDuration} min</span>",
        "                </div>",
        "                <div class='dima-analytics-item'>",
        "                    <span>Features Used:</span>",
        "                    <span class='dima-analytics-value'>${window.usageStats.featuresUsed}</span>",
        "                </div>",
        "            </div>",
        "            <div class='dima-analytics-section'>",
        "                <div class='dima-analytics-title'>🎯 Performance Metrics</div>",
        "                <div class='dima-analytics-item'>",
        "                    <span>AI Responses:</span>",
        "                    <span class='dima-analytics-value'>${window.usageStats.aiResponses}</span>",
        "                </div>",
        "                <div class='dima-analytics-item'>",
        "                    <span>Response Quality:</span>",
        "                    <span class='dima-analytics-value'>${responseQuality}</span>",
        "                </div>",
        "                <div class='dima-analytics-item'>",
        "                    <span>Voice Inputs:</span>",
        "                    <span class='dima-analytics-value'>${window.usageStats.voiceInputs}</span>",
        "                </div>",
        "            </div>",
        "            <div class='dima-analytics-section'>",
        "                <div class='dima-analytics-title'>💡 Feature Recommendations</div>",
        "                <div class='dima-analytics-item'>",
        "                    <span>File Uploads:</span>",
        "                    <span class='dima-analytics-value'>${window.usageStats.fileUploads}</span>",
        "                </div>",
        "                <div class='dima-analytics-item'>",
        "                    <span>Exports:</span>",
        "                    <span class='dima-analytics-value'>${window.usageStats.exports}</span>",
        "                </div>",
        "                <div class='dima-analytics-item'>",
        "                    <span>Mods Used:</span>",
        "                    <span class='dima-analytics-value'>${window.usageStats.modsUsed}</span>",
        "                </div>",
        "            </div>",
        "        </div>",
        "    `;",
        "    ",
        "    window.addAiMessage('assistant', analyticsHTML);",
        "};",

        "window.showAutomation = function() {",
        "    const automationHTML = `",
        "        <div class='dima-automation-panel'>",
        "            <div class='dima-analytics-title'>🤖 AI-Powered Automation</div>",
        "            <div class='dima-automation-item' onclick='window.createCustomMod()'>",
        "                <strong>🔧 Auto-Mod Creation</strong><br>",
        "                <small>AI generates custom mods based on your needs</small>",
        "            </div>",
        "            <div class='dima-automation-item' onclick='window.smartAutomation()'>",
        "                <strong>⚡ Smart Automation</strong><br>",
        "                <small>AI automates repetitive tasks for you</small>",
        "            </div>",
        "            <div class='dima-automation-item' onclick='window.predictiveFeatures()'>",
        "                <strong>🔮 Predictive Features</strong><br>",
        "                <small>AI suggests mods before you need them</small>",
        "            </div>",
        "            <div class='dima-automation-item' onclick='window.intelligentDebugging()'>",
        "                <strong>🐛 Intelligent Debugging</strong><br>",
        "                <small>AI helps fix broken mods and issues</small>",
        "            </div>",
        "        </div>",
        "    `;",
        "    ",
        "    window.addAiMessage('assistant', automationHTML);",
        "};",

        "window.createCustomMod = function() {",
        "    const modRequest = prompt('Describe the custom mod you want to create:');",
        "    if (modRequest) {",
        "        window.addAiMessage('user', `🔧 Create custom mod: ${modRequest}`);",
        "        window.addAiMessage('assistant', `🤖 **Custom Mod Creation**\\n\\nI'll analyze your request and create a custom mod for: **${modRequest}**\\n\\nThis feature will generate JavaScript code that you can copy and use in the Script Executor.`);",
        "        ",
        "        const customModCode = `(function() {\\n    document.body.style.border = '2px solid #e06c75';\\n})();`;",
        "        ",
        "        window.addAiMessage('assistant', `📋 **Generated Custom Mod**\\n\\n\\`\\`\\`javascript\\n${customModCode}\\n\\`\\`\\`\\n\\nCopy this code and paste it into the Script Executor to activate your custom mod!`);",
        "    }",
        "};",

        "window.smartAutomation = function() {",
        "    window.addAiMessage('assistant', `⚡ **Smart Automation Activated**\\n\\nI can now help you automate repetitive tasks. Here are some examples:\\n\\n• **Form filling** - Automatically fill forms\\n• **Data extraction** - Extract data from pages\\n• **Content modification** - Batch modify page content\\n• **Navigation automation** - Auto-navigate through pages\\n\\nJust describe what you want to automate!`);",
        "};",

        "window.predictiveFeatures = function() {",
        "    const context = JSON.parse(window.getPageContext());",
        "    const suggestions = [];",
        "    ",
        "    if (context.elements.forms > 0) suggestions.push('Form Auto-Filler');",
        "    if (context.elements.images > 5) suggestions.push('Image Gallery Creator');",
        "    if (context.elements.links > 10) suggestions.push('Link Organizer');",
        "    if (!context.security.hasHttps) suggestions.push('Security Enhancer');",
        "    ",
        "    window.addAiMessage('assistant', `🔮 **Predictive Features**\\n\\nBased on your current page, I recommend:\\n\\n${suggestions.map(s => `• ${s}`).join('\\n')}\\n\\nThese features would be most useful for your current situation. Would you like me to create any of these?`);",
        "};",

        "window.intelligentDebugging = function() {",
        "    window.addAiMessage('assistant', `🐛 **Intelligent Debugging**\\n\\nI can help you debug issues with:\\n\\n• **Broken mods** - Fix non-working features\\n• **Script errors** - Debug JavaScript issues\\n• **Performance problems** - Optimize slow operations\\n• **Compatibility issues** - Fix browser conflicts\\n\\nDescribe the problem you're experiencing and I'll help you fix it!`);",
        "};",

        "window.trackUsage = function(action) {",
        "    if (!window.usageStats) {",
        "        window.usageStats = {",
        "            messagesSent: 0,",
        "            modsUsed: 0,",
        "            featuresUsed: 0,",
        "            sessionStart: new Date(),",
        "            aiResponses: 0,",
        "            voiceInputs: 0,",
        "            fileUploads: 0,",
        "            exports: 0",
        "        };",
        "    }",
        "    ",
        "    switch(action) {",
        "        case 'message': window.usageStats.messagesSent++; break;",
        "        case 'ai_response': window.usageStats.aiResponses++; break;",
        "        case 'mod_used': window.usageStats.modsUsed++; break;",
        "        case 'feature_used': window.usageStats.featuresUsed++; break;",
        "        case 'voice_input': window.usageStats.voiceInputs++; break;",
        "        case 'file_upload': window.usageStats.fileUploads++; break;",
        "        case 'export': window.usageStats.exports++; break;",
        "    }",
        "};",

        "window.formatAiMessage = function(content) {",
        "    let formattedContent = content;",
        "    formattedContent = formattedContent.replace(/```(\\w+)?\\n([\\s\\S]*?)```/g, function(match, lang, code) {",
        "        const language = lang || 'javascript';",
        "        const codeBlock = `<div style='background: rgba(0,0,0,0.8); border-radius: 8px; padding: 12px; margin: 8px 0; font-family: monospace; font-size: 0.9em; color: #e06c75; border-left: 4px solid #e06c75; overflow-x: auto;'><div style='color: #888; margin-bottom: 8px; font-size: 0.8em;'>${language.toUpperCase()}</div><pre style='margin: 0; white-space: pre-wrap; word-wrap: break-word;'>${code}</pre><button onclick='window.copyCodeToClipboard(this)' style='background: #e06c75; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 0.8em; cursor: pointer; margin-top: 8px;'>Copy Code</button></div>`;",
        "        return codeBlock;",
        "    });",
        "    formattedContent = formattedContent.replace(/`([^`]+)`/g, '<code style=\"background: rgba(224, 108, 117, 0.2); padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em;\">$1</code>');",
        "    formattedContent = formattedContent.replace(/\\n/g, '<br>');",
        "    return formattedContent;",
        "};",

        "window.copyCodeToClipboard = function(button) {",
        "    const codeBlock = button.parentElement;",
        "    const preElement = codeBlock.querySelector('pre');",
        "    const code = preElement.textContent;",
        "    navigator.clipboard.writeText(code).then(() => {",
        "        const originalText = button.textContent;",
        "        button.textContent = 'Copied!';",
        "        button.style.background = '#28a745';",
        "        setTimeout(() => {",
        "            button.textContent = originalText;",
        "            button.style.background = '#e06c75';",
        "        }, 2000);",
        "    }).catch(() => {",
        "        const textarea = document.createElement('textarea');",
        "        textarea.value = code;",
        "        document.body.appendChild(textarea);",
        "        textarea.select();",
        "        document.execCommand('copy');",
        "        document.body.removeChild(textarea);",
        "        const originalText = button.textContent;",
        "        button.textContent = 'Copied!';",
        "        button.style.background = '#28a745';",
        "        setTimeout(() => {",
        "            button.textContent = originalText;",
        "            button.style.background = '#e06c75';",
        "        }, 2000);",
        "    });",
        "};",

        "window.clearAiChat = function() {",
        "    const messages = window.aiChat.querySelectorAll('.dima-ai-message');",
        "    messages.forEach(msg => {",
        "        if (!msg.querySelector('.dima-ai-avatar').textContent.includes('🤖') || msg.querySelector('.dima-ai-text').textContent !== 'Hello! I\\'m your AI assistant. How can I help you today?') {",
        "            msg.remove();",
        "        }",
        "    });",
        "    window.aiConversationHistory = [];",
        "};",

        "window.copyLastAiResponse = function() {",
        "    if (window.lastAiResponse) {",
        "        navigator.clipboard.writeText(window.lastAiResponse).then(() => {",
        "            const originalText = window.aiCopyButton.textContent;",
        "            window.aiCopyButton.textContent = 'Copied!';",
        "            setTimeout(() => {",
        "                window.aiCopyButton.textContent = originalText;",
        "            }, 2000);",
        "        }).catch(() => {",
        "            const textarea = document.createElement('textarea');",
        "            textarea.value = window.lastAiResponse;",
        "            document.body.appendChild(textarea);",
        "            textarea.select();",
        "            document.execCommand('copy');",
        "            document.body.removeChild(textarea);",
        "            const originalText = window.aiCopyButton.textContent;",
        "            window.aiCopyButton.textContent = 'Copied!';",
        "            setTimeout(() => {",
        "                window.aiCopyButton.textContent = originalText;",
        "            }, 2000);",
        "        });",
        "    }",
        "};",
        "function initializeMainMenu() {",
        "const closeButton = document.getElementById('dima-close-btn');",
        "const minimizeButton = document.getElementById('dima-minimize-btn');",
        "const settingsButtonIcon = document.getElementById('dima-settings-btn');",
        "const controlBar = document.getElementById('dima-control-bar');",
        "const navItems = clientContainer.querySelectorAll('.dima-nav-item');",
        "const contentSections = clientContainer.querySelectorAll('.dima-content-section');",
        "const proxyInputElement = document.getElementById('dima-proxy-input');",
        "const proxyButtonElement = document.getElementById('dima-proxy-button');",
        "const colorSlider = document.getElementById('dima-color-slider');",
        "const toggleDark = document.getElementById('dima-toggle-dark');",
        "const toggleLight = document.getElementById('dima-toggle-light');",
        "const toggleRainbow = document.getElementById('dima-toggle-rainbow');",
        "const toggleInspect = document.getElementById('dima-toggle-inspect');",
        "const toggleVpn = document.getElementById('dima-toggle-vpn');",
        "const toggleAls = document.getElementById('dima-toggle-als');",
        "const toggleAa = document.getElementById('dima-toggle-aa');",
        "const toggleVc = document.getElementById('dima-toggle-vc');",
        "const toggleMatrix = document.getElementById('dima-toggle-matrix');",
        "const toggleAutoclick = document.getElementById('dima-toggle-autoclick');",
        "const togglePageSpam = document.getElementById('dima-toggle-pagespam');",
        "const toggleHardReset = document.getElementById('dima-toggle-hardreset');",
        "const toggleDestroyPage = document.getElementById('dima-toggle-destroypage');",
        "const toggleResetMenu = document.getElementById('dima-toggle-resetmenu');",
        "const toggleClientFix = document.getElementById('dima-toggle-clientfix');",
        "const scriptInput = document.getElementById('dima-script-input');",
        "const scriptExecuteButton = document.getElementById('dima-script-execute-button');",
        "const scriptExecuteBackupButton = document.getElementById('dima-script-execute-backup-button');",
        "const scriptSaveButton = document.getElementById('dima-script-save-button');",
        "const scriptLoadButtonStyled = document.getElementById('dima-script-load-button-styled');",
        "const scriptFileInput = document.getElementById('dima-script-file-input');",

        "let originalContentEditable = document.body.isContentEditable; let isMinimized = false;",
        "mouseMoveListenerGlobal = (e) => { lastMouseX = e.clientX; lastMouseY = e.clientY; };",
        "document.addEventListener('mousemove', mouseMoveListenerGlobal);",
        "const performClose = () => { if (isAutoclicking) { isAutoclicking = false; clearInterval(autoclickIntervalId); if (autoclickerKeydownListener) document.removeEventListener('keydown', autoclickerKeydownListener); autoclickerKeydownListener = null; if(toggleAutoclick) toggleAutoclick.checked = false;} if(mouseMoveListenerGlobal) document.removeEventListener('mousemove', mouseMoveListenerGlobal); mouseMoveListenerGlobal = null; if (matrixCanvas) matrixCanvas.remove(); if (matrixIntervalId) clearInterval(matrixIntervalId); matrixIntervalId = null; clientContainer.style.opacity = '0'; clientContainer.style.transform = 'scale(0.9) translateY(20px)'; setTimeout(() => { if (clientContainer && clientContainer.parentNode) clientContainer.remove(); if (styleSheetElement && styleSheetElement.parentNode) styleSheetElement.remove(); document.documentElement.classList.remove('dima-dark-mode-filter'); if (document.body.hasAttribute('data-dima-contenteditable-original')) { document.body.contentEditable = document.body.getAttribute('data-dima-contenteditable-original'); document.body.removeAttribute('data-dima-contenteditable-original'); } else { document.body.contentEditable = originalContentEditable; } document.body.style.cursor = ''; }, 300); };",
        "if (closeButton) closeButton.onclick = performClose;",
        "if (toggleResetMenu) { toggleResetMenu.onchange = function() { if (this.checked) { performClose(); } }; }",
        "if (minimizeButton) minimizeButton.onclick = function() { isMinimized = !isMinimized; clientContainer.classList.toggle('dima-minimized', isMinimized); this.innerHTML = isMinimized ? '➕' : '−'; this.title = isMinimized ? 'Restore' : 'Minimize'; };",
        "const activateTab = (sectionName) => { if (!contentSections || contentSections.length === 0) { return; } contentSections.forEach(section => section.classList.remove('active')); const targetContentSection = document.getElementById(`dima-content-section-${sectionName}`); if (targetContentSection) { targetContentSection.style.animation = 'none'; requestAnimationFrame(() => { targetContentSection.style.animation = ''; targetContentSection.classList.add('active'); }); } if (!navItems || navItems.length === 0) { } else { navItems.forEach(nav => nav.classList.remove('active')); if (sectionName !== 'settings') { const targetNavItem = clientContainer.querySelector(`.dima-nav-item[data-section='${sectionName}']`); if (targetNavItem) targetNavItem.classList.add('active'); } } if (isMinimized && sectionName !== '') { if (minimizeButton && minimizeButton.textContent === '➕') minimizeButton.click(); } };",
        "if (settingsButtonIcon) { settingsButtonIcon.onclick = function() { activateTab('settings'); }; }",
        "if (navItems && navItems.length > 0) { navItems.forEach(item => { item.onclick = function() { if (this.classList.contains('active')) return; activateTab(this.dataset.section); }; }); }",
        "if (proxyButtonElement && proxyInputElement) { proxyButtonElement.onclick = function() { let url = proxyInputElement.value.trim(); if (!url) { if(typeof alert === 'function') alert('Please enter a URL.'); return; } if (!url.startsWith('http://') && !url.startsWith('https://')) { url = 'https://' + url; } const proxyService = 'https://api.allorigins.win/raw?url='; try { proxyButtonElement.textContent = 'Loading...'; proxyButtonElement.disabled = true; setTimeout(() => { window.location.href = proxyService + encodeURIComponent(url); }, 500); } catch (e) { if(typeof alert === 'function') alert('Could not create proxy URL.'); proxyButtonElement.textContent = 'Go'; proxyButtonElement.disabled = false; } }; proxyInputElement.onkeypress = function(e) { if (e.key === 'Enter') { proxyButtonElement.click(); } }; }",

        "const setupPlaceholderToggle = (checkbox, name, autoUncheck = true) => { if (!checkbox) { return; } checkbox.onchange = function() { if (this.checked) { if (autoUncheck && name !== 'Client Fix') { setTimeout(() => { if (this) this.checked = false; }, 100); } } }; };",
        "setupPlaceholderToggle(toggleVpn, 'VPN V1.6', false);",
        "setupPlaceholderToggle(toggleAls, 'Anti Light Speed V2', false);",
        "setupPlaceholderToggle(toggleAa, 'Anti Admin V1.4', false);",
        "setupPlaceholderToggle(toggleVc, 'Virtual Clone', false);",
        "setupPlaceholderToggle(toggleClientFix, 'Client Fix', false);",

        "if (toggleDark) toggleDark.onchange = function() { if (this.checked) { document.documentElement.classList.add('dima-dark-mode-filter'); if (toggleLight && toggleLight.checked) toggleLight.checked = false; } else { if (!toggleLight || !toggleLight.checked) document.documentElement.classList.remove('dima-dark-mode-filter'); } };",
        "if (toggleLight) toggleLight.onchange = function() { if (this.checked) { document.documentElement.classList.remove('dima-dark-mode-filter'); if (toggleDark && toggleDark.checked) toggleDark.checked = false; } };",
        "if (toggleRainbow) toggleRainbow.onchange = function() { clientContainer.classList.toggle('dima-rainbow-active', this.checked); if (!this.checked) { clientContainer.style.borderColor = ''; clientContainer.style.boxShadow = ''; } };",
        "if (toggleInspect) toggleInspect.onchange = function() { if (this.checked) { if (!document.body.hasAttribute('data-dima-contenteditable-original')) { document.body.setAttribute('data-dima-contenteditable-original', document.body.isContentEditable.toString()); } document.body.contentEditable = 'true'; document.body.style.cursor = 'text'; } else { if (document.body.hasAttribute('data-dima-contenteditable-original')) { document.body.contentEditable = document.body.getAttribute('data-dima-contenteditable-original'); } else { document.body.contentEditable = originalContentEditable; } document.body.style.cursor = 'default'; } };",
        "if (colorSlider) { const updateAccentColor = (hue) => { const newAccentColor = `hsl(${hue}, 80%, 65%)`; clientContainer.style.setProperty('--dima-accent', newAccentColor); colorSlider.style.setProperty('--dima-accent', newAccentColor); const tempColor = newAccentColor.startsWith('#') ? newAccentColor : getComputedStyle(document.documentElement).getPropertyValue('--dima-accent').trim(); const match = tempColor.match(/^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i) || tempColor.match(/^hsl\\(\\s*(\\d+)\\s*,\\s*(\\d+)%\\s*,\\s*(\\d+)%\\s*\\)$/i); if(match && match.length >= 4 && !tempColor.startsWith('#')) { const r = parseInt( (255 * (parseFloat(match[3])/100) * (1 - (parseFloat(match[2])/100) * Math.abs(2 * 0.5 -1 )) + (parseFloat(match[2])/100) * (parseFloat(match[3])/100) * Math.abs(2 * 0.5 -1 )) ); const finalComputedColor = getComputedStyle(clientContainer).getPropertyValue('--dima-accent').trim(); const rgbMatch = finalComputedColor.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)/); if(rgbMatch) clientContainer.style.setProperty('--dima-accent-rgb', `${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}`); } else if (match && match.length >=4 && tempColor.startsWith('#')) { clientContainer.style.setProperty('--dima-accent-rgb', `${parseInt(match[1], 16)}, ${parseInt(match[2], 16)}, ${parseInt(match[3], 16)}`); } }; colorSlider.oninput = function() { updateAccentColor(this.value); }; updateAccentColor(colorSlider.value); }",
        "if (toggleMatrix) toggleMatrix.onchange = function() { if (this.checked) { if (!matrixCanvas) { matrixCanvas = document.createElement('canvas'); matrixCanvas.id = 'dima-matrix-canvas'; document.body.appendChild(matrixCanvas); matrixCtx = matrixCanvas.getContext('2d'); matrixCanvas.height = window.innerHeight; matrixCanvas.width = window.innerWidth; matrixColumns = Math.floor(matrixCanvas.width / matrixFontSize); matrixDrops = []; for (let x = 0; x < matrixColumns; x++) matrixDrops[x] = 1; } matrixCanvas.style.display = 'block'; if (matrixIntervalId) clearInterval(matrixIntervalId); matrixIntervalId = setInterval(drawMatrix, 50); } else { if (matrixIntervalId) clearInterval(matrixIntervalId); matrixIntervalId = null; if (matrixCanvas) matrixCanvas.style.display = 'none'; } };",
        "if (toggleAutoclick) toggleAutoclick.onchange = function() { if (this.checked) { isAutoclicking = true; autoclickerKeydownListener = (e) => { if (e.key === '`' && isAutoclicking) { toggleAutoclick.checked = false; toggleAutoclick.dispatchEvent(new Event('change')); } }; document.addEventListener('keydown', autoclickerKeydownListener); if (autoclickIntervalId) clearInterval(autoclickIntervalId); autoclickIntervalId = setInterval(() => { if (!isAutoclicking) return; const el = document.elementFromPoint(lastMouseX, lastMouseY); if (el && typeof el.click === 'function' && clientContainer && el !== clientContainer && !clientContainer.contains(el)) { el.click(); } }, 100); } else { isAutoclicking = false; if(autoclickIntervalId) clearInterval(autoclickIntervalId); autoclickIntervalId = null; if (autoclickerKeydownListener) { document.removeEventListener('keydown', autoclickerKeydownListener); autoclickerKeydownListener = null; } } };",
        "if (togglePageSpam) togglePageSpam.onchange = function() { if (this.checked) { for (let i = 0; i < 100; i++) { window.open('about:blank', '_blank'); } this.checked = false; } };",

        "const rainbowCursorToggle = document.getElementById('dima-toggle-rainbowcursor');",
        "if (rainbowCursorToggle) {",
        "    rainbowCursorToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableRainbowCursor();",
        "        } else {",
        "            disableRainbowCursor();",
        "        }",
        "    };",
        "}",

        "const pageExplosionToggle = document.getElementById('dima-toggle-pageexplosion');",
        "if (pageExplosionToggle) {",
        "    pageExplosionToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enablePageExplosion();",
        "        } else {",
        "            disablePageExplosion();",
        "        }",
        "    };",
        "}",

        "const gravityToggle = document.getElementById('dima-toggle-gravity');",
        "if (gravityToggle) {",
        "    gravityToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableGravity();",
        "        } else {",
        "            disableGravity();",
        "        }",
        "    };",
        "}",

        "const pageFlipToggle = document.getElementById('dima-toggle-pageflip');",
        "if (pageFlipToggle) {",
        "    pageFlipToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enablePageFlip();",
        "        } else {",
        "            disablePageFlip();",
        "        }",
        "    };",
        "}",

        "const randomColorsToggle = document.getElementById('dima-toggle-randomcolors');",
        "if (randomColorsToggle) {",
        "    randomColorsToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableRandomColors();",
        "        } else {",
        "            disableRandomColors();",
        "        }",
        "    };",
        "}",

        "const pageMeltToggle = document.getElementById('dima-toggle-pagemelt');",
        "if (pageMeltToggle) {",
        "    pageMeltToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enablePageMelt();",
        "        } else {",
        "            disablePageMelt();",
        "        }",
        "    };",
        "}",

        "const bouncingToggle = document.getElementById('dima-toggle-bouncing');",
        "if (bouncingToggle) {",
        "    bouncingToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableBouncing();",
        "        } else {",
        "            disableBouncing();",
        "        }",
        "    };",
        "}",

        "const tornadoToggle = document.getElementById('dima-toggle-tornado');",
        "if (tornadoToggle) {",
        "    tornadoToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableTornado();",
        "        } else {",
        "            disableTornado();",
        "        }",
        "    };",
        "}",

        "const discoToggle = document.getElementById('dima-toggle-disco');",
        "if (discoToggle) {",
        "    discoToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableDisco();",
        "        } else {",
        "            disableDisco();",
        "        }",
        "    };",
        "}",

        "const earthquakeToggle = document.getElementById('dima-toggle-earthquake');",
        "if (earthquakeToggle) {",
        "    earthquakeToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableEarthquake();",
        "        } else {",
        "            disableEarthquake();",
        "        }",
        "    };",
        "}",

        "const floatingToggle = document.getElementById('dima-toggle-floating');",
        "if (floatingToggle) {",
        "    floatingToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableFloating();",
        "        } else {",
        "            disableFloating();",
        "        }",
        "    };",
        "}",

        "const vortexToggle = document.getElementById('dima-toggle-vortex');",
        "if (vortexToggle) {",
        "    vortexToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableVortex();",
        "        } else {",
        "            disableVortex();",
        "        }",
        "    };",
        "}",

        "const keybindToggle = document.getElementById('dima-toggle-keybind');",
        "if (keybindToggle) {",
        "    keybindToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableKeybind();",
        "        } else {",
        "            disableKeybind();",
        "        }",
        "    };",
        "}",

        "const quickHideToggle = document.getElementById('dima-toggle-quickhide');",
        "if (quickHideToggle) {",
        "    quickHideToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableQuickHide();",
        "        } else {",
        "            disableQuickHide();",
        "        }",
        "    };",
        "}",

        "const emergencyToggle = document.getElementById('dima-toggle-emergency');",
        "if (emergencyToggle) {",
        "    emergencyToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableEmergency();",
        "        } else {",
        "            disableEmergency();",
        "        }",
        "    };",
        "}",

        "const lowPerfToggle = document.getElementById('dima-toggle-lowperf');",
        "if (lowPerfToggle) {",
        "    lowPerfToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableLowPerformance();",
        "        } else {",
        "            disableLowPerformance();",
        "        }",
        "    };",
        "}",

        "const autoSaveToggle = document.getElementById('dima-toggle-autosave');",
        "if (autoSaveToggle) {",
        "    autoSaveToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableAutoSave();",
        "        } else {",
        "            disableAutoSave();",
        "        }",
        "    };",
        "}",

        "const backgroundToggle = document.getElementById('dima-toggle-background');",
        "if (backgroundToggle) {",
        "    backgroundToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableBackground();",
        "        } else {",
        "            disableBackground();",
        "        }",
        "    };",
        "}",

        "const stealthToggle = document.getElementById('dima-toggle-stealth');",
        "if (stealthToggle) {",
        "    stealthToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableStealth();",
        "        } else {",
        "            disableStealth();",
        "        }",
        "    };",
        "}",

        "const autoHideToggle = document.getElementById('dima-toggle-autohide');",
        "if (autoHideToggle) {",
        "    autoHideToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableAutoHide();",
        "        } else {",
        "            disableAutoHide();",
        "        }",
        "    };",
        "}",

        "const encryptionToggle = document.getElementById('dima-toggle-encryption');",
        "if (encryptionToggle) {",
        "    encryptionToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableEncryption();",
        "        } else {",
        "            disableEncryption();",
        "        }",
        "    };",
        "}",

        "const compactToggle = document.getElementById('dima-toggle-compact');",
        "if (compactToggle) {",
        "    compactToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableCompact();",
        "        } else {",
        "            disableCompact();",
        "        }",
        "    };",
        "}",

        "const alwaysTopToggle = document.getElementById('dima-toggle-alwaystop');",
        "if (alwaysTopToggle) {",
        "    alwaysTopToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableAlwaysTop();",
        "        } else {",
        "            disableAlwaysTop();",
        "        }",
        "    };",
        "}",

        "const transparencyToggle = document.getElementById('dima-toggle-transparency');",
        "if (transparencyToggle) {",
        "    transparencyToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableTransparency();",
        "        } else {",
        "            disableTransparency();",
        "        }",
        "    };",
        "}",

        "const debugToggle = document.getElementById('dima-toggle-debug');",
        "if (debugToggle) {",
        "    debugToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableDebug();",
        "        } else {",
        "            disableDebug();",
        "        }",
        "    };",
        "}",

        "const devToolsToggle = document.getElementById('dima-toggle-devtools');",
        "if (devToolsToggle) {",
        "    devToolsToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableDevTools();",
        "        } else {",
        "            disableDevTools();",
        "        }",
        "    };",
        "}",

        "const experimentalToggle = document.getElementById('dima-toggle-experimental');",
        "if (experimentalToggle) {",
        "    experimentalToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableExperimental();",
        "        }",
        "    };",
        "}",

        "const opacitySlider = document.getElementById('dima-opacity-slider');",
        "if (opacitySlider) {",
        "    opacitySlider.oninput = function() {",
        "        const opacity = this.value / 100;",
        "        clientContainer.style.opacity = opacity;",
        "    };",
        "}",

        "const proxy2Button = document.getElementById('dima-proxy2-button');",
        "if (proxy2Button) {",
        "    proxy2Button.onclick = function() {",
        "        window.open('https://my-ip6.de.my-ip6.de/', '_blank');",
        "    };",
        "}",
        "if (toggleHardReset) toggleHardReset.onchange = function() { if (this.checked) { location.reload(); } };",
        "if (toggleDestroyPage) toggleDestroyPage.onchange = function() { if (this.checked) { try { window.close(); } catch(e) { } this.checked = false; } };",

        "const elementRemoverToggle = document.getElementById('dima-toggle-elementremover');",
        "if (elementRemoverToggle) {",
        "    elementRemoverToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableElementRemover();",
        "        } else {",
        "            disableElementRemover();",
        "        }",
        "    };",
        "}",

        "const textChangerToggle = document.getElementById('dima-toggle-textchanger');",
        "if (textChangerToggle) {",
        "    textChangerToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableTextChanger();",
        "        } else {",
        "            disableTextChanger();",
        "        }",
        "    };",
        "}",

        "const glitchToggle = document.getElementById('dima-toggle-glitch');",
        "if (glitchToggle) {",
        "    glitchToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableGlitchEffect();",
        "        } else {",
        "            disableGlitchEffect();",
        "        }",
        "    };",
        "}",

        "const rainbowTextToggle = document.getElementById('dima-toggle-rainbowtext');",
        "if (rainbowTextToggle) {",
        "    rainbowTextToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableRainbowText();",
        "        } else {",
        "            disableRainbowText();",
        "        }",
        "    };",
        "}",

        "const shakeToggle = document.getElementById('dima-toggle-shake');",
        "if (shakeToggle) {",
        "    shakeToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableShakeEffect();",
        "        } else {",
        "            disableShakeEffect();",
        "        }",
        "    };",
        "}",

        "const invertToggle = document.getElementById('dima-toggle-invert');",
        "if (invertToggle) {",
        "    invertToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableInvertColors();",
        "        } else {",
        "            disableInvertColors();",
        "        }",
        "    };",
        "}",

        "const imageReplacerToggle = document.getElementById('dima-toggle-imagereplacer');",
        "if (imageReplacerToggle) {",
        "    imageReplacerToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableImageReplacer();",
        "        } else {",
        "            disableImageReplacer();",
        "        }",
        "    };",
        "}",

        "const styleInjectorToggle = document.getElementById('dima-toggle-styleinjector');",
        "if (styleInjectorToggle) {",
        "    styleInjectorToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableStyleInjector();",
        "        } else {",
        "            disableStyleInjector();",
        "        }",
        "    };",
        "}",

        "const fontChangerToggle = document.getElementById('dima-toggle-fontchanger');",
        "if (fontChangerToggle) {",
        "    fontChangerToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableFontChanger();",
        "        } else {",
        "            disableFontChanger();",
        "        }",
        "    };",
        "}",

        "const blurToggle = document.getElementById('dima-toggle-blur');",
        "if (blurToggle) {",
        "    blurToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableBlurEffect();",
        "        } else {",
        "            disableBlurEffect();",
        "        }",
        "    };",
        "}",

        "const pageInfoToggle = document.getElementById('dima-toggle-pageinfo');",
        "if (pageInfoToggle) {",
        "    pageInfoToggle.onchange = function() {",
        "        if (this.checked) {",
        "            showPageInfo();",
        "        } else {",
        "            hidePageInfo();",
        "        }",
        "    };",
        "}",

        "const elementCounterToggle = document.getElementById('dima-toggle-elementcounter');",
        "if (elementCounterToggle) {",
        "    elementCounterToggle.onchange = function() {",
        "        if (this.checked) {",
        "            showElementCounter();",
        "        } else {",
        "            hideElementCounter();",
        "        }",
        "    };",
        "}",

        "const linkExtractorToggle = document.getElementById('dima-toggle-linkextractor');",
        "if (linkExtractorToggle) {",
        "    linkExtractorToggle.onchange = function() {",
        "        if (this.checked) {",
        "            extractLinks();",
        "        }",
        "    };",
        "}",

        "const imageDownloaderToggle = document.getElementById('dima-toggle-imagedownloader');",
        "if (imageDownloaderToggle) {",
        "    imageDownloaderToggle.onchange = function() {",
        "        if (this.checked) {",
        "            downloadAllImages();",
        "        }",
        "    };",
        "}",

        "const antiDetectionToggle = document.getElementById('dima-toggle-antidetection');",
        "if (antiDetectionToggle) {",
        "    antiDetectionToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableAntiDetection();",
        "        } else {",
        "            disableAntiDetection();",
        "        }",
        "    };",
        "}",

        "const scriptBlockerToggle = document.getElementById('dima-toggle-scriptblocker');",
        "if (scriptBlockerToggle) {",
        "    scriptBlockerToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableScriptBlocker();",
        "        } else {",
        "            disableScriptBlocker();",
        "        }",
        "    };",
        "}",

        "const adBlockerToggle = document.getElementById('dima-toggle-adblocker');",
        "if (adBlockerToggle) {",
        "    adBlockerToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableAdBlocker();",
        "        } else {",
        "            disableAdBlocker();",
        "        }",
        "    };",
        "}",

        "const confettiToggle = document.getElementById('dima-toggle-confetti');",
        "if (confettiToggle) {",
        "    confettiToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableConfetti();",
        "        } else {",
        "            disableConfetti();",
        "        }",
        "    };",
        "}",

        "const cursorTrailsToggle = document.getElementById('dima-toggle-cursortrails');",
        "if (cursorTrailsToggle) {",
        "    cursorTrailsToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableCursorTrails();",
        "        } else {",
        "            disableCursorTrails();",
        "        }",
        "    };",
        "}",

        "const pageShakeToggle = document.getElementById('dima-toggle-pageshake');",
        "if (pageShakeToggle) {",
        "    pageShakeToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enablePageShake();",
        "        } else {",
        "            disablePageShake();",
        "        }",
        "    };",
        "}",

        "const textScramblerToggle = document.getElementById('dima-toggle-textscrambler');",
        "if (textScramblerToggle) {",
        "    textScramblerToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableTextScrambler();",
        "        } else {",
        "            disableTextScrambler();",
        "        }",
        "    };",
        "}",

        "const textHighlighterToggle = document.getElementById('dima-toggle-texthighlighter');",
        "if (textHighlighterToggle) {",
        "    textHighlighterToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableTextHighlighter();",
        "        } else {",
        "            disableTextHighlighter();",
        "        }",
        "    };",
        "}",

        "const elementMoverToggle = document.getElementById('dima-toggle-elementmover');",
        "if (elementMoverToggle) {",
        "    elementMoverToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableElementMover();",
        "        } else {",
        "            disableElementMover();",
        "        }",
        "    };",
        "}",

        "const colorPickerToggle = document.getElementById('dima-toggle-colorpicker');",
        "if (colorPickerToggle) {",
        "    colorPickerToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableColorPicker();",
        "        } else {",
        "            disableColorPicker();",
        "        }",
        "    };",
        "}",

        "const screenshotToggle = document.getElementById('dima-toggle-screenshot');",
        "if (screenshotToggle) {",
        "    screenshotToggle.onchange = function() {",
        "        if (this.checked) {",
        "            takeScreenshot();",
        "        }",
        "    };",
        "}",

        "const wordCounterToggle = document.getElementById('dima-toggle-wordcounter');",
        "if (wordCounterToggle) {",
        "    wordCounterToggle.onchange = function() {",
        "        if (this.checked) {",
        "            showWordCounter();",
        "        }",
        "    };",
        "}",

        "const passwordRevealerToggle = document.getElementById('dima-toggle-passwordrevealer');",
        "if (passwordRevealerToggle) {",
        "    passwordRevealerToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enablePasswordRevealer();",
        "        } else {",
        "            disablePasswordRevealer();",
        "        }",
        "    };",
        "}",

        "const formFillerToggle = document.getElementById('dima-toggle-formfiller');",
        "if (formFillerToggle) {",
        "    formFillerToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableFormFiller();",
        "        } else {",
        "            disableFormFiller();",
        "        }",
        "    };",
        "}",

        "const cookieManagerToggle = document.getElementById('dima-toggle-cookiemanager');",
        "if (cookieManagerToggle) {",
        "    cookieManagerToggle.onchange = function() {",
        "        if (this.checked) {",
        "            showCookieManager();",
        "        }",
        "    };",
        "}",

        "const threeDTransformToggle = document.getElementById('dima-toggle-3dtransform');",
        "if (threeDTransformToggle) {",
        "    threeDTransformToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enable3DTransform();",
        "        } else {",
        "            disable3DTransform();",
        "        }",
        "    };",
        "}",

        "const particleSystemToggle = document.getElementById('dima-toggle-particlesystem');",
        "if (particleSystemToggle) {",
        "    particleSystemToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableParticleSystem();",
        "        } else {",
        "            disableParticleSystem();",
        "        }",
        "    };",
        "}",

        "const waveEffectToggle = document.getElementById('dima-toggle-waveeffect');",
        "if (waveEffectToggle) {",
        "    waveEffectToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableWaveEffect();",
        "        } else {",
        "            disableWaveEffect();",
        "        }",
        "    };",
        "}",

        "const neonGlowToggle = document.getElementById('dima-toggle-neonglow');",
        "if (neonGlowToggle) {",
        "    neonGlowToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enableNeonGlow();",
        "        } else {",
        "            disableNeonGlow();",
        "        }",
        "    };",
        "}",

        "const metaInspectorToggle = document.getElementById('dima-toggle-metainspector');",
        "if (metaInspectorToggle) {",
        "    metaInspectorToggle.onchange = function() {",
        "        if (this.checked) {",
        "            showMetaInspector();",
        "        }",
        "    };",
        "}",

        "const performanceMonitorToggle = document.getElementById('dima-toggle-performancemonitor');",
        "if (performanceMonitorToggle) {",
        "    performanceMonitorToggle.onchange = function() {",
        "        if (this.checked) {",
        "            enablePerformanceMonitor();",
        "        } else {",
        "            disablePerformanceMonitor();",
        "        }",
        "    };",
        "}",

        "const networkInspectorToggle = document.getElementById('dima-toggle-networkinspector');",
        "if (networkInspectorToggle) {",
        "    networkInspectorToggle.onchange = function() {",
        "        if (this.checked) {",
        "            showNetworkInspector();",
        "        }",
        "    };",
        "}",

        "const securityScannerToggle = document.getElementById('dima-toggle-securityscanner');",
        "if (securityScannerToggle) {",
        "    securityScannerToggle.onchange = function() {",
        "        if (this.checked) {",
        "            runSecurityScanner();",
        "        }",
        "    };",
        "}",

        "window.aiInput = document.getElementById('dima-ai-input');",
        "window.aiSendButton = document.getElementById('dima-ai-send');",
        "window.aiChat = document.getElementById('dima-ai-chat');",
        "window.aiClearButton = document.getElementById('dima-ai-clear');",
        "window.aiCopyButton = document.getElementById('dima-ai-copy');",
        "window.aiSuggestionsButton = document.getElementById('dima-ai-suggestions');",
        "window.aiQuickActionsButton = document.getElementById('dima-ai-quick-actions');",
        "window.aiVoiceButton = document.getElementById('dima-ai-voice');",
        "window.aiUploadButton = document.getElementById('dima-ai-upload');",
        "window.aiScreenshotButton = document.getElementById('dima-ai-screenshot');",
        "window.aiExportButton = document.getElementById('dima-ai-export');",
        "window.aiAnalyticsButton = document.getElementById('dima-ai-analytics');",
        "window.aiAutomationButton = document.getElementById('dima-ai-automation');",
        "window.aiFileInput = document.getElementById('dima-ai-file-input');",
        "window.aiScreenshotInput = document.getElementById('dima-ai-screenshot-input');",

        "window.GROQ_API_KEY = localStorage.getItem('dima_ai_api_key') || '';",
        "window.lastAiResponse = '';",
        "window.aiConversationHistory = [];",

        "if (window.aiSendButton && window.aiInput) {",
        "    window.aiSendButton.onclick = function() { window.sendAiMessage(); };",
        "    window.aiInput.onkeypress = function(e) {",
        "        if (e.key === 'Enter' && !e.shiftKey) {",
        "            e.preventDefault();",
        "            window.sendAiMessage();",
        "        }",
        "    };",
        "}",

        "if (window.aiClearButton) {",
        "    window.aiClearButton.onclick = function() { window.clearAiChat(); };",
        "}",

        "if (window.aiCopyButton) {",
        "    window.aiCopyButton.onclick = function() { window.copyLastAiResponse(); };",
        "}",

        "if (window.aiSuggestionsButton) {",
        "    window.aiSuggestionsButton.onclick = function() { window.showSmartSuggestions(); };",
        "}",

        "if (window.aiQuickActionsButton) {",
        "    window.aiQuickActionsButton.onclick = function() { window.addQuickActions(); };",
        "}",

        "if (window.aiVoiceButton) {",
        "    window.aiVoiceButton.onclick = function() { window.startVoiceInput(); };",
        "}",

        "if (window.aiUploadButton) {",
        "    window.aiUploadButton.onclick = function() { window.aiFileInput.click(); };",
        "}",

        "if (window.aiScreenshotButton) {",
        "    window.aiScreenshotButton.onclick = function() { window.aiScreenshotInput.click(); };",
        "}",

        "if (window.aiExportButton) {",
        "    window.aiExportButton.onclick = function() { window.exportConversation(); };",
        "}",

        "if (window.aiFileInput) {",
        "    window.aiFileInput.onchange = function(event) {",
        "        const file = event.target.files[0];",
        "        if (file) {",
        "            window.handleFileUpload(file);",
        "            event.target.value = null;",
        "        }",
        "    };",
        "}",

        "if (window.aiScreenshotInput) {",
        "    window.aiScreenshotInput.onchange = function(event) {",
        "        const file = event.target.files[0];",
        "        if (file) {",
        "            window.handleScreenshotUpload(file);",
        "            event.target.value = null;",
        "        }",
        "    };",
        "}",

        "if (window.aiAnalyticsButton) {",
        "    window.aiAnalyticsButton.onclick = function() { window.showAnalytics(); window.trackUsage('feature_used'); };",
        "}",

        "if (window.aiAutomationButton) {",
        "    window.aiAutomationButton.onclick = function() { window.showAutomation(); window.trackUsage('feature_used'); };",
        "}",

        "function enableRainbowCursor() {",
        "    const cursor = document.createElement('div');",
        "    cursor.id = 'rainbow-cursor';",
        "    cursor.style.cssText = 'position: fixed; width: 20px; height: 20px; border-radius: 50%; pointer-events: none; z-index: 999999; mix-blend-mode: difference;';",
        "    document.body.appendChild(cursor);",
        "    let hue = 0;",
        "    const moveHandler = (e) => {",
        "        cursor.style.left = e.clientX - 10 + 'px';",
        "        cursor.style.top = e.clientY - 10 + 'px';",
        "        cursor.style.background = `hsl(${hue}, 100%, 50%)`;",
        "        hue = (hue + 5) % 360;",
        "    };",
        "    document.addEventListener('mousemove', moveHandler);",
        "    window.rainbowCursorHandler = moveHandler;",
        "}",

        "function disableRainbowCursor() {",
        "    const cursor = document.getElementById('rainbow-cursor');",
        "    if (cursor) cursor.remove();",
        "    if (window.rainbowCursorHandler) {",
        "        document.removeEventListener('mousemove', window.rainbowCursorHandler);",
        "    }",
        "}",

        "function enablePageExplosion() {",
        "    const elements = document.querySelectorAll('*');",
        "    elements.forEach((el, index) => {",
        "        if (el.style && el !== document.body && el !== document.documentElement) {",
        "            setTimeout(() => {",
        "                el.style.transition = 'all 0.5s ease';",
        "                el.style.transform = `translate(${Math.random() * 1000 - 500}px, ${Math.random() * 1000 - 500}px) rotate(${Math.random() * 720 - 360}deg) scale(${Math.random() * 2})`;",
        "                el.style.opacity = '0';",
        "            }, index * 10);",
        "        }",
        "    });",
        "}",

        "function disablePageExplosion() {",
        "    const elements = document.querySelectorAll('*');",
        "    elements.forEach(el => {",
        "        if (el.style) {",
        "            el.style.transition = '';",
        "            el.style.transform = '';",
        "            el.style.opacity = '';",
        "        }",
        "    });",
        "}",

        "function enableGravity() {",
        "    const elements = document.querySelectorAll('*');",
        "    elements.forEach(el => {",
        "        if (el.style && el !== document.body && el !== document.documentElement) {",
        "            el.style.transition = 'all 0.1s ease';",
        "            el.style.transform = 'translateY(100vh)';",
        "        }",
        "    });",
        "}",

        "function disableGravity() {",
        "    const elements = document.querySelectorAll('*');",
        "    elements.forEach(el => {",
        "        if (el.style) {",
        "            el.style.transition = '';",
        "            el.style.transform = '';",
        "        }",
        "    });",
        "}",

        "function enablePageFlip() {",
        "    document.body.style.transition = 'transform 1s ease';",
        "    document.body.style.transform = 'rotateY(180deg)';",
        "}",

        "function disablePageFlip() {",
        "    document.body.style.transition = 'transform 1s ease';",
        "    document.body.style.transform = '';",
        "}",

        "function enableRandomColors() {",
        "    const elements = document.querySelectorAll('*');",
        "    elements.forEach(el => {",
        "        if (el.style) {",
        "            el.style.color = `hsl(${Math.random() * 360}, 100%, 50%)`;",
        "            el.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;",
        "        }",
        "    });",
        "}",

        "function disableRandomColors() {",
        "    const elements = document.querySelectorAll('*');",
        "    elements.forEach(el => {",
        "        if (el.style) {",
        "            el.style.color = '';",
        "            el.style.backgroundColor = '';",
        "        }",
        "    });",
        "}",

        "function enablePageMelt() {",
        "    const elements = document.querySelectorAll('*');",
        "    elements.forEach((el, index) => {",
        "        if (el.style && el !== document.body && el !== document.documentElement) {",
        "            setTimeout(() => {",
        "                el.style.transition = 'all 2s ease';",
        "                el.style.transform = 'translateY(100vh) scale(0.1)';",
        "                el.style.opacity = '0';",
        "            }, index * 50);",
        "        }",
        "    });",
        "}",

        "function disablePageMelt() {",
        "    const elements = document.querySelectorAll('*');",
        "    elements.forEach(el => {",
        "        if (el.style) {",
        "            el.style.transition = '';",
        "            el.style.transform = '';",
        "            el.style.opacity = '';",
        "        }",
        "    });",
        "}",

        "function enableBouncing() {",
        "    const elements = document.querySelectorAll('*');",
        "    elements.forEach(el => {",
        "        if (el.style && el !== document.body && el !== document.documentElement) {",
        "            el.style.animation = 'bounce 0.5s infinite alternate';",
        "        }",
        "    });",
        "    const style = document.createElement('style');",
        "    style.textContent = '@keyframes bounce { to { transform: translateY(-10px); } }';",
        "    document.head.appendChild(style);",
        "}",

        "function disableBouncing() {",
        "    const elements = document.querySelectorAll('*');",
        "    elements.forEach(el => {",
        "        if (el.style) {",
        "            el.style.animation = '';",
        "        }",
        "    });",
        "}",

        "function enableTornado() {",
        "    const elements = document.querySelectorAll('*');",
        "    elements.forEach((el, index) => {",
        "        if (el.style && el !== document.body && el !== document.documentElement) {",
        "            setTimeout(() => {",
        "                el.style.transition = 'all 1s ease';",
        "                el.style.transform = `rotate(${Math.random() * 720 - 360}deg) scale(${Math.random() * 3})`;",
        "            }, index * 20);",
        "        }",
        "    });",
        "}",

        "function disableTornado() {",
        "    const elements = document.querySelectorAll('*');",
        "    elements.forEach(el => {",
        "        if (el.style) {",
        "            el.style.transition = '';",
        "            el.style.transform = '';",
        "        }",
        "    });",
        "}",

        "function enableDisco() {",
        "    const style = document.createElement('style');",
        "    style.textContent = '@keyframes disco { 0% { background: red; } 25% { background: blue; } 50% { background: green; } 75% { background: yellow; } 100% { background: red; } }';",
        "    document.head.appendChild(style);",
        "    document.body.style.animation = 'disco 0.5s infinite';",
        "}",

        "function disableDisco() {",
        "    document.body.style.animation = '';",
        "}",

        "function enableEarthquake() {",
        "    const style = document.createElement('style');",
        "    style.textContent = '@keyframes earthquake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }';",
        "    document.head.appendChild(style);",
        "    document.body.style.animation = 'earthquake 0.1s infinite';",
        "}",

        "function disableEarthquake() {",
        "    document.body.style.animation = '';",
        "}",

        "function enableFloating() {",
        "    const elements = document.querySelectorAll('*');",
        "    elements.forEach(el => {",
        "        if (el.style && el !== document.body && el !== document.documentElement) {",
        "            el.style.animation = 'float 3s ease-in-out infinite';",
        "        }",
        "    });",
        "    const style = document.createElement('style');",
        "    style.textContent = '@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }';",
        "    document.head.appendChild(style);",
        "}",

        "function disableFloating() {",
        "    const elements = document.querySelectorAll('*');",
        "    elements.forEach(el => {",
        "        if (el.style) {",
        "            el.style.animation = '';",
        "        }",
        "    });",
        "}",

        "function enableVortex() {",
        "    const elements = document.querySelectorAll('*');",
        "    elements.forEach((el, index) => {",
        "        if (el.style && el !== document.body && el !== document.documentElement) {",
        "            setTimeout(() => {",
        "                el.style.transition = 'all 2s ease';",
        "                el.style.transform = 'rotate(360deg) scale(0)';",
        "                el.style.opacity = '0';",
        "            }, index * 30);",
        "        }",
        "    });",
        "}",

        "function disableVortex() {",
        "    const elements = document.querySelectorAll('*');",
        "    elements.forEach(el => {",
        "        if (el.style) {",
        "            el.style.transition = '';",
        "            el.style.transform = '';",
        "            el.style.opacity = '';",
        "        }",
        "    });",
        "}",

        "function enableKeybind() {",
        "    const keybindHandler = (e) => {",
        "        if (e.ctrlKey && e.shiftKey && e.key === 'K') {",
        "            e.preventDefault();",
        "            if (clientContainer.style.display === 'none') {",
        "                clientContainer.style.display = 'block';",
        "            } else {",
        "                clientContainer.style.display = 'none';",
        "            }",
        "        }",
        "    };",
        "    document.addEventListener('keydown', keybindHandler);",
        "    window.keybindHandler = keybindHandler;",
        "}",

        "function disableKeybind() {",
        "    if (window.keybindHandler) {",
        "        document.removeEventListener('keydown', window.keybindHandler);",
        "        window.keybindHandler = null;",
        "    }",
        "}",

        "function enableQuickHide() {",
        "    const quickHideHandler = (e) => {",
        "        if (e.ctrlKey && e.key === 'h') {",
        "            e.preventDefault();",
        "            clientContainer.style.opacity = '0';",
        "            setTimeout(() => {",
        "                clientContainer.style.opacity = '1';",
        "            }, 2000);",
        "        }",
        "    };",
        "    document.addEventListener('keydown', quickHideHandler);",
        "    window.quickHideHandler = quickHideHandler;",
        "}",

        "function disableQuickHide() {",
        "    if (window.quickHideHandler) {",
        "        document.removeEventListener('keydown', window.quickHideHandler);",
        "        window.quickHideHandler = null;",
        "    }",
        "}",

        "function enableEmergency() {",
        "    const emergencyHandler = (e) => {",
        "        if (e.ctrlKey && e.shiftKey && e.key === 'X') {",
        "            e.preventDefault();",
        "            performClose();",
        "        }",
        "    };",
        "    document.addEventListener('keydown', emergencyHandler);",
        "    window.emergencyHandler = emergencyHandler;",
        "}",

        "function disableEmergency() {",
        "    if (window.emergencyHandler) {",
        "        document.removeEventListener('keydown', window.emergencyHandler);",
        "        window.emergencyHandler = null;",
        "    }",
        "}",

        "function enableLowPerformance() {",
        "    clientContainer.style.setProperty('--dima-animation-duration', '0.1s');",
        "    document.body.style.setProperty('--dima-animation-duration', '0.1s');",
        "}",

        "function disableLowPerformance() {",
        "    clientContainer.style.setProperty('--dima-animation-duration', '0.3s');",
        "    document.body.style.setProperty('--dima-animation-duration', '0.3s');",
        "}",

        "function enableAutoSave() {",
        "    const saveSettings = () => {",
        "        const settings = {};",
        "        document.querySelectorAll('.dima-toggle-container input[type=\"checkbox\"]').forEach(toggle => {",
        "            settings[toggle.id] = toggle.checked;",
        "        });",
        "        localStorage.setItem('dima-settings', JSON.stringify(settings));",
        "    };",
        "    setInterval(saveSettings, 5000);",
        "}",

        "function disableAutoSave() {",
        "    localStorage.removeItem('dima-settings');",
        "}",

        "function enableBackground() {",
        "    document.body.style.setProperty('--dima-bg-dark', 'rgba(0,0,0,0.8)');",
        "    document.body.style.setProperty('--dima-bg-light', 'rgba(255,255,255,0.1)');",
        "}",

        "function disableBackground() {",
        "    document.body.style.setProperty('--dima-bg-dark', 'rgba(0,0,0,0.9)');",
        "    document.body.style.setProperty('--dima-bg-light', 'rgba(255,255,255,0.05)');",
        "}",

        "function enableStealth() {",
        "    clientContainer.style.setProperty('--dima-shadow', 'none');",
        "    clientContainer.style.setProperty('--dima-border', 'rgba(255,255,255,0.1)');",
        "}",

        "function disableStealth() {",
        "    clientContainer.style.setProperty('--dima-shadow', '0 8px 32px rgba(0,0,0,0.3)');",
        "    clientContainer.style.setProperty('--dima-border', 'rgba(255,255,255,0.2)');",
        "}",

        "function enableAutoHide() {",
        "    document.addEventListener('visibilitychange', () => {",
        "        if (document.hidden) {",
        "            clientContainer.style.opacity = '0';",
        "        } else {",
        "            clientContainer.style.opacity = '1';",
        "        }",
        "    });",
        "}",

        "function disableAutoHide() {",
        "    clientContainer.style.opacity = '1';",
        "}",

        "function enableEncryption() {",
        "    const originalData = localStorage.getItem('dima-settings');",
        "    if (originalData) {",
        "        const encrypted = btoa(originalData);",
        "        localStorage.setItem('dima-settings-encrypted', encrypted);",
        "        localStorage.removeItem('dima-settings');",
        "    }",
        "}",

        "function disableEncryption() {",
        "    const encryptedData = localStorage.getItem('dima-settings-encrypted');",
        "    if (encryptedData) {",
        "        const decrypted = atob(encryptedData);",
        "        localStorage.setItem('dima-settings', decrypted);",
        "        localStorage.removeItem('dima-settings-encrypted');",
        "    }",
        "}",

        "function enableCompact() {",
        "    clientContainer.style.setProperty('--dima-control-bar-height', '30px');",
        "    clientContainer.style.fontSize = '0.8em';",
        "}",

        "function disableCompact() {",
        "    clientContainer.style.setProperty('--dima-control-bar-height', '40px');",
        "    clientContainer.style.fontSize = '';",
        "}",

        "function enableAlwaysTop() {",
        "    clientContainer.style.zIndex = '999999';",
        "}",

        "function disableAlwaysTop() {",
        "    clientContainer.style.zIndex = '1000';",
        "}",

        "function enableTransparency() {",
        "    clientContainer.style.backdropFilter = 'blur(10px)';",
        "    clientContainer.style.backgroundColor = 'rgba(0,0,0,0.5)';",
        "}",

        "function disableTransparency() {",
        "    clientContainer.style.backdropFilter = '';",
        "    clientContainer.style.backgroundColor = '';",
        "}",

        "function enableDebug() {",
        "    window.debugMode = true;",
        "}",

        "function disableDebug() {",
        "    window.debugMode = false;",
        "}",

        "function enableDevTools() {",
        "    const devTools = document.createElement('div');",
        "    devTools.id = 'dima-dev-tools';",
        "    devTools.style.cssText = 'position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; z-index: 10000; font-size: 12px;';",
        "    devTools.innerHTML = 'Dev Tools Active';",
        "    document.body.appendChild(devTools);",
        "}",

        "function disableDevTools() {",
        "    const devTools = document.getElementById('dima-dev-tools');",
        "    if (devTools) devTools.remove();",
        "}",

        "function enableExperimental() {",
        "    clientContainer.style.setProperty('--dima-accent', '#ff6b6b');",
        "    clientContainer.style.setProperty('--dima-accent-rgb', '255, 107, 107');",
        "}",


        "const executeUserScript = (isBackup = false) => { const scriptToRun = scriptInput.value; if (scriptToRun) { try { (0, eval)(scriptToRun); } catch (err) { if(typeof alert === 'function') alert('Error in your script:\\nName: ' + err.name + '\\nMessage: ' + err.message); } } else { if(typeof alert === 'function') alert('Script input is empty.'); }};",
        "if (scriptExecuteButton) scriptExecuteButton.onclick = () => executeUserScript(false);",
        "if (scriptExecuteBackupButton) scriptExecuteBackupButton.onclick = () => executeUserScript(true);",
        "if (scriptSaveButton && scriptInput) { scriptSaveButton.onclick = function() { const scriptContent = scriptInput.value; const blob = new Blob([scriptContent], { type: 'text/javascript;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'dima_script.js'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); }; }",
        "if (scriptLoadButtonStyled && scriptFileInput && scriptInput) { scriptLoadButtonStyled.onclick = function() { scriptFileInput.click(); }; scriptFileInput.onchange = function(event) { const file = event.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = function(e) { scriptInput.value = e.target.result; }; reader.onerror = function() { if(typeof alert === 'function') alert('Error reading file.');}; reader.readAsText(file); event.target.value = null; } }; }",
        "let isDragging = false; let offsetX, offsetY;",
        "if (controlBar) controlBar.onmousedown = function(e) { if (e.target.closest('.dima-window-controls button')) return; isDragging = true; offsetX = e.clientX - clientContainer.offsetLeft; offsetY = e.clientY - clientContainer.offsetTop; clientContainer.style.transition = 'opacity var(--dima-animation-duration) var(--dima-animation-timing), transform var(--dima-animation-duration) var(--dima-animation-timing)'; controlBar.style.cursor = 'grabbing'; e.preventDefault(); };",
        "document.onmousemove = function(e) { if (!isDragging || !clientContainer) return; let newX = e.clientX - offsetX; let newY = e.clientY - offsetY; const currentClientHeight = isMinimized ? parseFloat(getComputedStyle(clientContainer).getPropertyValue('--dima-control-bar-height')) : clientContainer.offsetHeight; const currentClientWidth = isMinimized ? 220 : clientContainer.offsetWidth; const maxX = window.innerWidth - currentClientWidth; const maxY = window.innerHeight - currentClientHeight; newX = Math.max(0, Math.min(newX, maxX)); newY = Math.max(0, Math.min(newY, maxY)); clientContainer.style.left = newX + 'px'; clientContainer.style.top = newY + 'px'; };",
        "document.onmouseup = function() { if (isDragging) { isDragging = false; if(clientContainer) clientContainer.style.transition = `opacity var(--dima-animation-duration) var(--dima-animation-timing), transform var(--dima-animation-duration) var(--dima-animation-timing), width var(--dima-animation-duration) var(--dima-animation-timing), min-height var(--dima-animation-duration) var(--dima-animation-timing)`; if (controlBar) controlBar.style.cursor = 'move'; } };",
        "activateTab('proxy');",

        "const savedApiKey = localStorage.getItem('dima_ai_api_key');",
        "if (savedApiKey) {",
        "    window.GROQ_API_KEY = savedApiKey;",
        "    const aiSetupContainer = document.getElementById('dima-ai-setup-container');",
        "    const aiMainContainer = document.getElementById('dima-ai-main-container');",
        "    if (aiSetupContainer && aiMainContainer) {",
        "        aiSetupContainer.style.display = 'none';",
        "        aiMainContainer.style.display = 'block';",
        "    }",
        "}",

        "const aiSetupButton = document.getElementById('dima-ai-setup-btn');",
        "if (aiSetupButton) {",
        "    aiSetupButton.onclick = function() {",
        "        const apiSetupElement = document.getElementById('dima-api-setup');",
        "        if (!apiSetupElement) {",
        "            clientContainer.appendChild(parseHTML(apiSetupHTMLString));",
        "            initializeApiSetup();",
        "        }",
        "    };",
        "}",
        "}",
    ];
    try {
        if (document.getElementById(DIMA_CLIENT_ID) && document.getElementById(DIMA_CLIENT_ID).querySelector('#dima-key-screen')) {
             return;
        }
        new Function(scriptParts.join('\n'))();
    } catch (e) {
        if(typeof alert === 'function') alert('DimaClient Outer Exec Error:\nName: ' + e.name + '\nMessage: ' + e.message);
    }
})();
