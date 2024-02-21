AWS.config.update({
    region: awsConfigOptions.identity_pool_id.split(':')[0],
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: awsConfigOptions.identity_pool_id
    })
});
var DateTime = luxon.DateTime;

const iconMap = {
    '/': 'bi-folder',
    '.jpg': 'bi-file-earmark-image',
    '.bmp': 'bi-file-earmark-image',
    '.gif': 'bi-file-earmark-image',
    '.heic': 'bi-file-earmark-image',
    '.png': 'bi-file-earmark-image',
    '.raw': 'bi-file-earmark-image',
    '.svg': 'bi-file-earmark-image',
    '.tiff': 'bi-file-earmark-image',
    '.pdf': 'bi-file-earmark-pdf',
    '.zip': 'bi-file-earmark-zip',
    '.pkg': 'bi-file-earmark-zip',
    '.tar.gz': 'bi-file-earmark-zip',
    '.gz': 'bi-file-earmark-zip',
    '.xls': 'bi-file-earmark-excel',
    '.xlsx': 'bi-file-earmark-excel',
    '.doc': 'bi-file-earmark-word',
    '.docx': 'bi-file-earmark-word',
    '.ppt': 'bi-file-earmark-slides',
    '.pptx': 'bi-file-earmark-slides',

    '.aac': 'bi-file-earmark-music',
    '.wav': 'bi-file-earmark-music',
    '.m4p': 'bi-file-earmark-music',
    '.mp3': 'bi-file-earmark-music',

    '.mov': 'bi-file-earmark-play',
    '.mp4': 'bi-file-earmark-play',

    '.css': 'bi-file-earmark-code',
    '.js': 'bi-file-earmark-code',
    '.json': 'bi-file-earmark-code',
    '.php': 'bi-file-earmark-code',
    '.py': 'bi-file-earmark-code',
    '.rb': 'bi-file-earmark-code',
    '.sass': 'bi-file-earmark-code',
    '.scss': 'bi-file-earmark-code',
    '.sh': 'bi-file-earmark-code',
    '.sql': 'bi-file-earmark-code',
    '.xml': 'bi-file-earmark-code',
    '.yml': 'bi-file-earmark-code',
    '.html': 'bi-file-earmark-code',
    '.java': 'bi-file-earmark-code',

    '.md': 'bi-file-earmark-text',
    '.txt': 'bi-file-earmark-text',

    '.csv': 'bi-file-earmark-spreadsheet',

    '.exe': 'bi-file-earmark-binary',

    '.ai': 'bi-filetype-ai',
    '.cs': 'bi-filetype-cs',
    '.jsx': 'bi-filetype-jsx',
    '.key': 'bi-filetype-key',
    '.mdx': 'bi-filetype-mdx',
    '.otf': 'bi-filetype-otf',
    '.psd': 'bi-filetype-psd',
    '.tsx': 'bi-filetype-tsx',
    '.ttf': 'bi-filetype-ttf',
    '.woff': 'bi-filetype-woff',
}

function reset(prefix = "", start_at = "") {
    // TODO: Opportunity to clean this up, make it more flexible and not all hard-coded, but it works great as-is
    if (prefix === '' && start_at === '') {
        if (window.location.search !== '') {
            window.history.pushState('', '', '/');
        }
    } else if (prefix === '' && start_at !== '') {
        const encodedStartAt = encodeURI(start_at)
        if (window.location.search !== ('?s=' + encodedStartAt)) {
            window.history.pushState('', '', '/?s=' + encodedStartAt);
        }
    } else if (prefix !== '' && start_at === '') {
        const encodedPrefix = encodeURI(prefix)
        if (window.location.search !== ('?p=' + encodedPrefix)) {
            window.history.pushState('', '', '/?p=' + encodedPrefix);
        }
    } else if (prefix !== '' && start_at !== '') {
        const encodedPrefix = encodeURI(prefix)
        const encodedStartAt = encodeURI(start_at)
        if (window.location.search !== ('?p=' + encodedPrefix + '&s=' + encodedStartAt)) {
            window.history.pushState('', '', '/?p=' + encodedPrefix + '&s=' + encodedStartAt);
        }
    } else {
        console.log('Error.')
    }
    const decodedPrefix = decodeURI(prefix)
    const decodedStartAt = decodeURI(start_at)
    document.title = awsConfigOptions.site_name + ' - /' + decodedPrefix;
    $('#site_current_path').html(generate_title_breadcrumbs(prefix))
    renderTable(decodedPrefix, decodedStartAt);
}

function generate_title_breadcrumbs(prefix) {
    let prefix_split = prefix.split('/')
    let objLink = '/'
    let onClick = ' onclick="return localNav(\'\');"'
    let title_text = '<a class="link-dark" href="' + objLink + '"' + onClick + '>Home</a> / '
    let prior_paths = ''
    for (const item of prefix_split) {
        prior_paths += item + '/'
        objLink = '/?p=' + prior_paths
        onClick = ' onclick="return localNav(\'' + btoa(prior_paths) + '\');"'
        title_text += '<a class="link-dark" href="' + objLink + '"' + onClick + '>' + decodeURI(item) + '</a> / '
    }
    return title_text.substring(0, title_text.length - 3)
}

function renderTable(prefix, start_at = '') {
    // TODO: Could look at normalizing the prefix parameter here in case a trailing slash or something gets missed in the URL
    let s3 = new AWS.S3({
        apiVersion: "2006-03-01",
    });
    let params = {
        Bucket: awsConfigOptions.bucket_name,
        Delimiter: '/'
        //StartAfter: 'Lots of Files/548.txt'
    };
    if (start_at.length > 0) {
        params['StartAfter'] = start_at
    }
    if (prefix.length > 0) {
        params.Prefix = prefix
    }
    s3.listObjectsV2(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            let newRows = ''
            //console.log(data);
            if (data['Prefix'].length > 0) {
                newRows += getRow('..', data['Prefix'], true)
            }
            let newKeys = get_display_order(data);
            for (const key of newKeys['Order']) {
                newRows += getRow(newKeys['Keys'][key], data['Prefix'])
            }
            if (newKeys['isTruncated'] === true) {
                newRows += getPagination(data['Prefix'], newKeys['Order'][newKeys['Order'].length - 1]);
            }
            $('#listingBody').html(newRows)
        }
    });
}

function get_display_order(data) {
    // Interesting behavior here. S3 object/prefix lists are ordered lexicographically (UTF-8 byte order).
    // For this to make sense I'm proposing two modes:
    // <=1000 Objects/Prefixes
    //    - Sort how most filesystems do (lexicographically with folders always on top)
    //    - This makes the system make intuitive sense for 99% of listings and views
    // >1000 Objects
    //    - Strictly lexicographically so folders may be interspersed
    //    - While this is less intuitive it is consistent without listing the entire bucket. This would inflate
    //      costs and load times unnecessarily. The alternative would be to take each page and treat it as above
    //      but this leads to odd ordering that almost seems random since the top of one page is not always the
    //      next object of the previous page (it is all the next folders lexicographically).
    let newKeys = []
    let prefixKeys = []
    let objectKeys = []
    for (const item of data['CommonPrefixes']) {
        newKeys[item['Prefix']] = item
        prefixKeys.push(item['Prefix'])
    }
    for (const item of data['Contents']) {
        // Oddity here where sometimes the response contains its own key as an item?
        if (item['Key'] !== data['Prefix']) {
            newKeys[item['Key']] = item
            objectKeys.push(item['Key'])
        }
    }
    let isTruncated = false
    let newOrder = []
    if (data['IsTruncated'] === true || data.hasOwnProperty('StartAfter')) {
        // This response is either truncated, or a non-default starting point response (AKA subsequent page)
        // Sort strictly lexicographically so folders may be interspersed
        newOrder = Object.keys(newKeys).sort()
        isTruncated = true
    } else {
        // Sort how most filesystems do (lexicographically with folders always on top)
        newOrder = prefixKeys.sort().concat(objectKeys.sort())
    }
    return {
        'Keys': newKeys,
        'Order': newOrder,
        'isTruncated': isTruncated
    }
}

function getPagination(prefix, start_at) {
    objLink = '/?p=' + prefix + '&s=' + start_at
    onClick = ' onclick="return localNav(\'' + btoa(prefix) + '\', \'' + btoa(start_at) + '\');"'
    return '            <tr id="object_row">\n' +
        '                <td class="row_pagination" colspan="5" ><a href="' + objLink + '"' + onClick + '>Next »</a></td>\n' +
        '            </tr>';
}

function getRow(item, prefix, isNavToParent = false) {
    let objKey = ''
    let objIcon = ''
    let objLink = ''
    let onClick = ''
    let objSize = ''
    let objSizeMouseover = ''
    let objModified = ''
    let objModifiedMouseover = ''
    let objClass = '';
    let objTarget = '';
    if (isNavToParent) {
        // It's a parent "folder" link
        objKey = '..'
        objIcon = 'bi-folder-symlink'
        let newPrefix = encodeURI(prefix.substring(0, prefix.lastIndexOf('/', prefix.length - 2) + 1))
        if (newPrefix.length == 0) {
            objLink = '/'
        } else {
            objLink = '/?p=' + newPrefix
        }
        onClick = ' onclick="return localNav(\'' + btoa(newPrefix) + '\');"'
    } else if (item.hasOwnProperty('Prefix')) {
        // It's a "folder"
        objKey = item['Prefix']
        objIcon = getBootstrapImageIcon(objKey)
        let newPrefix = encodeURI(objKey)
        objLink = '/?p=' + newPrefix
        onClick = ' onclick="return localNav(\'' + btoa(newPrefix) + '\');"'
    } else {
        // It's an object
        objClass = item['StorageClass']
        // Skip invisible object classes
        if (awsConfigOptions.visible_storage_classes.indexOf(objClass) === -1) { return '' }
        objKey = item['Key']
        objIcon = getBootstrapImageIcon(objKey)
        objSize = s3FileSize(item['Size'], 1)
        objSizeMouseover = item['Size'].toLocaleString() + ' Bytes'
        dt = DateTime.fromJSDate(item['LastModified'])
        objModified = dt.toFormat('yyyy-LL-dd HH:mm:ss')
        objModifiedMouseover = dt.toRelative()
        objLink = '/' + encodeURI(objKey)
        if (awsConfigOptions.files_open_in_new_tab) {
            objTarget = ' target="_blank"'
        }
    }
    if (!isNavToParent && objKey.substring(0, prefix.length) == prefix) {
        objKey = objKey.substring(prefix.length)
    }
    let newRow =
        '            <tr id="object_row">\n' +
        '                <td class="row_icon"><i class="bi ' + objIcon + '"></i></td>\n' +
        '                <td class="row_key"><a href="' + objLink + '"' + onClick + objTarget + '>' + escapeHtml(objKey) + '</a></td>\n' +
        '                <td class="row_size"><span title="' + objSizeMouseover + '">' + objSize + '</span></td>\n' +
        '                <td class="row_modified"><span title="' + objModifiedMouseover + '">' + objModified + '</span></td>\n' +
        '                <td class="row_class">' + objClass + '</td>\n' +
        '            </tr>';
    return newRow
}

function getBootstrapImageIcon(key) {
    keyLow = key.toLowerCase()
    for (const [searchEnding, iconClass] of Object.entries(iconMap)) {
        if (keyLow.endsWith(searchEnding)) {
            return iconClass
        }
    }
    return 'bi-file'
}

$( document ).ready(function() {
	awsConfigOptions.visible_storage_classes = awsConfigOptions.visible_storage_classes.toUpperCase().split(',');
    processUrl();
});

function processUrl() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    reset(params['p'] ?? '', params['s'] ?? '')
}


function localNav(newPrefix, start_at) {
    reset(atob(newPrefix), atob(start_at))
    return false;
}

var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}

function s3FileSize(bytes, accuracy) {
    if (bytes < 2**10) {
        return bytes + ' B'
    } else if (bytes < 2**20) {
        return (bytes / 2**10).toFixed(accuracy) + ' KB'
    } else if (bytes < 2**30) {
        return (bytes / 2**20).toFixed(accuracy) + ' MB'
    } else if (bytes < 2**40) {
        return (bytes / 2**30).toFixed(accuracy) + ' GB'
    } else if (bytes < 2**50) {
        return (bytes / 2**40).toFixed(accuracy) + ' TB'
    } else if (bytes < 2**60) {
        return (bytes / 2**50).toFixed(accuracy) + ' PB'
    } else if (bytes < 2**70) {
        return (bytes / 2**60).toFixed(accuracy) + ' EB'
    } else if (bytes < 2**80) {
        return (bytes / 2**70).toFixed(accuracy) + ' ZB'
    } else {
        return (bytes / 2**80).toFixed(accuracy) + ' YB'
    }
}


window.addEventListener('popstate', event => {
   processUrl();
});
