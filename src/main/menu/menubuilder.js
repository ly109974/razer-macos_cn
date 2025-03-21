import { getDeviceMenuFor } from './menubuilderdevice';

export function getMenuFor(application) {
  const fullMenu = getMainMenu(application)
    .concat(getCustomColorsCycleMenu(application))
    .concat(getDeviceMenu(application))
    .concat(getMainMenuBottom(application));

  patch(fullMenu, application);
  return fullMenu;
}

function patch(deviceMenu, application) {
  deviceMenu.forEach(menuItem => {
    if (menuItem.hasOwnProperty('click')) {
      const originalClick = menuItem['click'];
      menuItem['click'] = (ev) => {
        application.razerApplication.stopAnimations();
        originalClick(ev);
      };
    } else if (menuItem.hasOwnProperty('submenu')) {
      patch(menuItem['submenu'], application);
    }
  });
}

function getMainMenu(application) {
  return [
    {
      label: '刷新设备列表',
      click() {
        application.refreshTray(true);
      },
    },
    {
      label: '清除所有设置',
      click() {
        application.showConfirm("确定清除所有设置吗？").then(result => {
          if(result.response === 0) {
            return application.razerApplication.settingsManager.clearAll();
          } else {
            return Promise.resolve();
          }
        }).then(() => {
          application.refreshTray(true);
        }).catch(() => {});
      }
    },
    {
      label: '状态管理器',
      click() {
        application.showView({
          mode: 'state',
          state: application.razerApplication.stateManager.serialize(),
        });
      },
    },
    { type: 'separator' },
    {
      label: '所有设备',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: '无效果',
      click() {
        application.razerApplication.deviceManager.activeRazerDevices.forEach(device => {
          device.setModeNone();
        });
      },
    },
    {
      label: '静态效果',
      submenu: [
        {
          label: '自定义',
          click() {
            application.razerApplication.deviceManager.activeRazerDevices.forEach(device => {
              device.setModeStatic(Object.values(device.settings.customColor1.rgb).slice(0,3));
            });
          },
        },
        {
          label: '红色',
          click() {
            application.razerApplication.deviceManager.activeRazerDevices.forEach(device => {
              device.setModeStatic([0xff, 0, 0]);
            });
          },
        },
        {
          label: '绿色',
          click() {
            application.razerApplication.deviceManager.activeRazerDevices.forEach(device => {
              device.setModeStatic([0, 0xff, 0]);
            });
          },
        },
        {
          label: '蓝色',
          click() {
            application.razerApplication.deviceManager.activeRazerDevices.forEach(device => {
              device.setModeStatic([0, 0, 0xff]);
            });
          },
        },
      ],
    },
    {
      label: '光谱效果',
      submenu: [
        {
          label: '按设备',
          toolTip: '为所有连接的设备运行光谱模式',
          click() {
            application.razerApplication.deviceManager.activeRazerDevices.forEach(device => {
              device.setSpectrum();
            });
          }
        },
        {
          label: '按动画',
          toolTip: '启动定时动画，为所有连接的设备更改颜色',
          click() {
            application.razerApplication.spectrumAnimation.start();
          }
        },
      ]
    },
  ];
}

function getCustomColorsCycleMenu(application) {
  const cccMenu = [
    {
      label: '开始循环',
      click() {
        application.razerApplication.cycleAnimation.start();
      },
    },
    {
      label: '停止循环',
      click() {
        application.razerApplication.cycleAnimation.stop();
      },
    },
    { type: 'separator' },
    {
      label: '添加颜色',
      click() {
        application.razerApplication.cycleAnimation.addColor({ r: 0x00, g: 0xff, b: 0x00 });
        application.refreshTray();
      },
    },
    {
      label: '重置颜色',
      click() {
        application.razerApplication.cycleAnimation.setColor([
          { r: 0xff, g: 0x00, b: 0x00 },
          { r: 0x00, g: 0xff, b: 0x00 },
          { r: 0x00, g: 0x00, b: 0xff },
        ]);
        application.refreshTray();
      },
    },
    { type: 'separator' },
  ];

  const colorItems = application.razerApplication.cycleAnimation.getAllColors().map((color, index) => {
    return {
      label: '颜色 ' + (index + 1),
      click: () => {
        application.showView({
          mode: 'color',
          index: index,
          color: color
        });
      },
    };
  });

  return [{
    label: '循环',
    submenu: cccMenu.concat(colorItems)
  }]
}

function getDeviceMenu(application) {
  return application.razerApplication.deviceManager.activeRazerDevices.map(device => getDeviceMenuFor(application, device)).flat();
}

function getMainMenuBottom(application) {
  return [
    { type: 'separator' },
    {
      label: '关于',
      submenu: [
        {
          label: `版本: ${application.APP_VERSION}`,
          enabled: false,
        },
      ],
    },
    {
      label: '退出',
      click() {
        application.quit();
      },
      accelerator: 'Command+Q',
    },
  ]
}