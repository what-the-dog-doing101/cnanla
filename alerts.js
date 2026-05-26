//alert for auto loging hashing upd.

(function() {
    // Prevent rendering if the user already dismissed this update notification
    if (localStorage.getItem('HASHUPDNOTIFY') === 'true') {
        return;
    }

    // 1. Inject styling with added button layouts
    const style = document.createElement('style');
    style.textContent = `
        .relogin-popup-container {
            position: fixed;
            bottom: -180px;
            left: 50%;
            transform: translateX(-50%);
            width: 50vw;
            min-width: 320px;
            background-color: #ffffff;
            box-shadow: 0 -5px 25px rgba(0, 0, 0, 0.15);
            border-radius: 12px 12px 0 0;
            padding: 24px;
            z-index: 10000;
            transition: bottom 0.45s cubic-bezier(0.25, 1, 0.5, 1);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            box-sizing: border-box;
            border-top: 4px solid #0076FF;
        }
        .relogin-popup-container.show {
            bottom: 0;
        }
        .relogin-text-content {
            margin-right: 20px;
            color: #2c3e50;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .relogin-text-content h4 {
            margin: 0;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: -0.2px;
        }
        .relogin-text-content p {
            margin: 0;
            font-size: 13.5px;
            color: #576574;
            line-height: 1.5;
        }
        .relogin-action-btn {
            align-self: flex-start;
            background-color: #0076FF;
            color: #ffffff;
            border: none;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        .relogin-action-btn:hover {
            background-color: #0056b3;
        }
        .relogin-close-btn {
            background: none;
            border: none;
            font-size: 24px;
            font-weight: 300;
            color: #a0aec0;
            cursor: pointer;
            padding: 0 5px;
            line-height: 0.8;
            transition: color 0.2s ease;
        }
        .relogin-close-btn:hover {
            color: #2d3748;
        }
        
        @media (max-width: 768px) {
            .relogin-popup-container {
                width: 100vw;
                border-radius: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // 2. Build Structural HTML including the CTA button
    const popup = document.createElement('div');
    popup.className = 'relogin-popup-container';
    popup.innerHTML = `
        <div class="relogin-text-content">
            <h4>Security & Token Synchronization Update</h4>
            <p>We have upgraded our platform authentication infrastructure to use advanced cryptographic hashing methods. To seamlessly re-verify your session parameters and ensure uninterrupted data delivery, please re-authenticate below.</p>
            <button class="relogin-action-btn">Re-login</button>
        </div>
        <button class="relogin-close-btn" aria-label="Dismiss Notification">&times;</button>
    `;
    document.body.appendChild(popup);

    // Helper logic to gracefully dismiss and execute logout tasks
    function handleLogoutAction() {
            clearLogin();
             localStorage.setItem('HASHUPDNOTIFY', 'true');

        popup.classList.remove('show');
        localStorage.setItem('HASHUPDNOTIFY', 'true');
        
        setTimeout(() => {
            popup.remove();
            style.remove();
        }, 450);
    }

    // 3. Initiate animation entry
    setTimeout(() => {
        popup.classList.add('show');
    }, 600);

function closePopup() {
    popup.classList.remove('show');
    localStorage.setItem('HASHUPDNOTIFY', 'false');
    popup.remove();
    style.remove();
    
}


    // 4. Attach synchronized event listeners
    const actionBtn = popup.querySelector('.relogin-action-btn');
    const closeBtn = popup.querySelector('.relogin-close-btn');

    actionBtn.addEventListener('click', handleLogoutAction);
    closeBtn.addEventListener('click', closePopup);
})();



