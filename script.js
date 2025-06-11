
const CLIENT_ID = '496131599054-k4td976vo0i5kumt3kugep8ao5b7jco9.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/presentations.readonly https://www.googleapis.com/auth/documents.readonly';
const ROOT_FOLDER_ID = '189B1E77WilkCb2Di7sBErVih0L3ccQif';

function showMessage(targetId, message) {
  const el = document.getElementById(targetId);
  if (el) el.innerHTML = `<p style="color: gray; font-style: italic;">${message}</p>`;
}

function init() {
  gapi.load('client:auth2', () => {
    gapi.client.init({
      clientId: CLIENT_ID,
      scope: SCOPES,
      discoveryDocs: [
        'https://slides.googleapis.com/$discovery/rest?version=v1',
        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
        'https://docs.googleapis.com/$discovery/rest?version=v1'
      ]
    }).then(() => {
      return gapi.auth2.getAuthInstance().signIn();
    }).then(() => {
      showMessage('sidebar', 'Loading folders...');
      buildFolderTree(ROOT_FOLDER_ID, document.getElementById('sidebar'));
    }).catch(err => {
      console.error('OAuth error:', err);
      showMessage('sidebar', 'Authentication failed.');
    });
  });
}

function buildFolderTree(folderId, container) {
  gapi.client.drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType)'
  }).then(res => {
    const files = res.result.files;
    if (files.length === 0) {
      showMessage('sidebar', 'No files found.');
    }
    files.forEach(file => {
      const el = document.createElement('div');
      el.textContent = file.name;
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        el.className = 'folder';
        const sub = document.createElement('div');
        sub.style.display = 'none';
        el.onclick = () => {
          const expanded = sub.style.display === 'none';
          sub.style.display = expanded ? 'block' : 'none';
          el.classList.toggle('expanded', expanded);
        };
        container.appendChild(el);
        container.appendChild(sub);
        buildFolderTree(file.id, sub);
      } else if (file.mimeType === 'application/vnd.google-apps.presentation') {
        el.className = 'file';
        el.onclick = () => loadSlides(file.id);
        container.appendChild(el);
      } else if (file.mimeType === 'application/vnd.google-apps.document') {
        el.className = 'file';
        el.onclick = () => loadDocs(file.id);
        container.appendChild(el);
      }
    });
  }).catch(err => {
    console.error('Drive API error:', err);
    showMessage('sidebar', 'Drive API failed.');
  });
}

function loadSlides(presentationId) {
  const viewer = document.getElementById('docViewer');
  showMessage('docViewer', 'Loading slides...');
  gapi.client.slides.presentations.get({ presentationId }).then(res => {
    const slides = res.result.slides;
    viewer.innerHTML = '';
    slides.forEach((slide, index) => {
      const img = document.createElement('img');
      img.src = `https://docs.google.com/presentation/d/${presentationId}/export/png?id=${presentationId}&pageid=${slide.objectId}`;
      img.alt = `Slide ${index + 1}`;
      img.style = 'width: 100%; margin-bottom: 20px;';
      viewer.appendChild(img);
    });
  }).catch(err => {
    console.error('Slides API error:', err);
    showMessage('docViewer', 'Failed to load slides.');
  });
}

function loadDocs(documentId) {
  const viewer = document.getElementById('docViewer');
  showMessage('docViewer', 'Opening Google Doc...');
  viewer.innerHTML = `<iframe src="https://docs.google.com/document/d/${documentId}/preview" style="width:100%; height:100vh; border:none;"></iframe>`;
}

document.addEventListener('DOMContentLoaded', () => { init(); });
