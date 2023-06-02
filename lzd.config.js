/**
 * icms toolkit config
 */
module.exports = {
    toolkit: '@ali/lzd-toolkit-icms',
    toolkitConfig: { port: 3000 },
    tasks: {
        start: [
            {
                // Must be daily/5.0.0 or later
                command: 'lzd git branch --gte 5.0.0'
            },
            {
                // Link the current project to .lzd/LocalCDNPath
                command: 'lzd link'
            },
            {
                // sync branch version to package.json
                command: 'lzd git sync'
            },
            {
                // init the git commit specification
                command: 'lzd commit init'
            },
            {
                // start proxy server
                command: 'lzd proxy start --enable',
                async: true
            }
        ],
        build: [{
                // sync branch version to package.json
                command: 'lzd git sync'
            }],
        open: [{
                // open the current project on gitlab
                command: 'lzd git open'
            }]
    },
    project: {
        'id': '700692',
        'name': 'Lazada Shopping Guide',
        'url': 'https://workitem.aone.alibaba-inc.com/project/700692'
    },
    sprint: {
        'daily/5.2.0': {
            id: '58751',
            name: '03.22 Week 12',
            url: 'https://workitem.aone.alibaba-inc.com/project/700692/sprint/detail?sprintId=58751'
        }
    }
};