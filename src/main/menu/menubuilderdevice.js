import { FeatureIdentifier } from '../feature/featureidentifier';
import { RazerDeviceType } from '../device/razerdevicetype';

export function getDeviceMenuFor(application, razerDevice) {
  let deviceMenu = [
    { type: 'separator' },
    getHeaderFor(application, razerDevice),
    { type: 'separator' },
  ];

  const featureMenu = razerDevice.features.map(feature => getFeatureMenuFor(application, razerDevice, feature)).filter(item => item != null);
  deviceMenu = deviceMenu.concat(featureMenu);
  return deviceMenu;
}

function getHeaderFor(application, razerDevice) {

  let label = razerDevice.name;
  let icon = null;
  switch (razerDevice.mainType) {
    case RazerDeviceType.KEYBOARD:
      break;
    case RazerDeviceType.MOUSE:
      if (razerDevice.hasFeature(FeatureIdentifier.BATTERY) && razerDevice.batteryLevel !== -1) {
        if (razerDevice.chargingStatus) {
          label = label + ' - ⚡' + razerDevice.batteryLevel.toString() + '%';
        } else {
          label = label + ' - 🔋' + razerDevice.batteryLevel.toString() + '%';
        }
      }
      break;
    case RazerDeviceType.MOUSEDOCK:
      break;
    case RazerDeviceType.MOUSEMAT:
      break;
    case RazerDeviceType.EGPU:
      break;
    case RazerDeviceType.HEADPHONE:
      break;
    case RazerDeviceType.ACCESSORY:
      break;
  }

  return {
    label: label,
    icon: icon,
    click() {
      application.showView({
        mode: 'device',
        device: razerDevice.serialize(),
      });
    },
  };
}

function getFeatureMenuFor(application, device, feature) {
  switch (feature.featureIdentifier) {
    case FeatureIdentifier.NONE:
      return getFeatureNone(application, device, feature);
    case FeatureIdentifier.STATIC:
      return getFeatureStatic(application, device, feature);
    case FeatureIdentifier.WAVE_SIMPLE:
      return getFeatureWaveSimple(application, device, feature);
    case FeatureIdentifier.WAVE_EXTENDED:
      return getFeatureWaveExtended(application, device, feature);
    case FeatureIdentifier.SPECTRUM:
      return getFeatureSpectrum(application, device, feature);
    case FeatureIdentifier.REACTIVE:
      return getFeatureReactive(application, device, feature);
    case FeatureIdentifier.BREATHE:
      return getFeatureBreath(application, device, feature);
    case FeatureIdentifier.STARLIGHT:
      return getFeatureStarlight(application, device, feature);
    case FeatureIdentifier.BRIGHTNESS:
      return getFeatureBrightness(application, device, feature);
    case FeatureIdentifier.RIPPLE:
      return getFeatureRipple(application, device, feature);
    case FeatureIdentifier.WHEEL:
      return getFeatureWheel(application, device, feature);
    case FeatureIdentifier.OLD_MOUSE_EFFECTS:
      return getFeatureOldMouseEffect(application, device, feature);
    case FeatureIdentifier.MOUSE_BRIGHTNESS:
      return getFeatureMouseBrightness(application, device, feature);
    case FeatureIdentifier.POLL_RATE:
      return null;
    case FeatureIdentifier.MOUSE_DPI:
      return null;
    case FeatureIdentifier.BATTERY:
      return null;
    default:
      throw 'Unmapped feature for identifier ' + feature.featureIdentifier + ' detected.';
  }
}

function getFeatureBreath(application, device, feature) {
  return {
    label: '呼吸效果',
    click() {
      // random
      device.setBreathe([0]);
    },
  };
}

function getFeatureBrightness(application, device, feature) {
  const updateBrightness = (brightness) => {
    device.setBrightness(brightness);
    application.refreshTray();
  };

  return {
    label: '亮度',
    submenu: [
      {
        label: `亮度: ${device.getBrightness()}%`,
      },
      { type: 'separator' },
      {
        label: '设置为 0%',
        click() {
          updateBrightness(0);
        },
      },
      {
        label: '设置为 100%',
        click() {
          updateBrightness(100);
        },
      },
    ],
  };
}

function getFeatureNone(application, device, feature) {
  return {
    label: '无效果',
    click() {
      device.setModeNone();
    },
  };
}

function getFeatureOldMouseEffect(application, device, feature) {
  const submenu = [
    feature.configuration.enabledStatic ? {
      label: '静态',
      click() {
        device.setLogoLEDEffect('static');
      },
    } : null,
    feature.configuration.enabledBlinking ? {
      label: '闪烁',
      click() {
        device.setLogoLEDEffect('blinking');
      },
    } : null,
    feature.configuration.enabledPulsate ? {
      label: '脉动',
      click() {
        device.setLogoLEDEffect('pulsate');
      },
    } : null,
    feature.configuration.enabledScroll ? {
      label: '滚动',
      click() {
        device.setLogoLEDEffect('scroll');
      },
    } : null,
  ];

  return {
    label: '旧型号效果',
    submenu: submenu.filter(s => s !== null),
  };
}

function getFeatureReactive(application, device, feature) {
  const singleItem = (label, colorMode) => {
    return {
      label: label,
      click() {
        device.setReactive(colorMode);
      },
    };
  };
  return {
    label: '反应效果',
    submenu: [
      singleItem('自定义颜色', [3, device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b]),
      singleItem('红色', [3, 0xff, 0, 0]),
      singleItem('绿色', [3, 0, 0xff, 0]),
      singleItem('蓝色', [3, 0, 0, 0xff]),
    ],
  };
}

function getFeatureRipple(application, device, feature) {
  if(feature.configuration == null || feature.configuration.rows === -1 ||  feature.configuration.cols === -1) {
    return {
      label: '涟漪效果',
      enabled: false
    };
  }

  const singleItem = (label, color, backgroundColor) => {
    return {
      label: label,
      click() {
        device.setRippleEffect(feature.configuration, color, backgroundColor);
      },
    };
  };

  return {
    label: '涟漪效果',
    submenu: [
      singleItem('自定义颜色', Object.values(device.settings.customColor1.rgb).slice(0, 3)),
      singleItem('自定义双色',
        Object.values(device.settings.customColor1.rgb).slice(0, 3),
        Object.values(device.settings.customColor2.rgb).slice(0, 3),
      ),
      singleItem('红色', [0xff, 0, 0]),
      singleItem('绿色', [0, 0xff, 0]),
      singleItem('蓝色', [0, 0, 0xff]),
    ],
  };
}

function getFeatureWheel(application, device, feature) {
  if(feature.configuration == null || feature.configuration.rows === -1 ||  feature.configuration.cols === -1) {
    return {
      label: '轮盘效果',
      enabled: false
    };
  }

  const singleItem = (label, speed) => {
    return {
      label: label,
      click() {
        device.setWheelEffect(feature.configuration, speed);
      },
    };
  };

  return {
    label: '轮盘效果',
    submenu: [
      singleItem('慢速', 3),
      singleItem('中速', 2),
      singleItem('快速', 1),
    ],
  };
}

function getFeatureSpectrum(application, device, feature) {
  return {
    label: '光谱效果',
    click() {
      device.setSpectrum();
    },
  };
}

function getFeatureStarlight(application, device, feature) {
  const singleItem = (label, speed, colors) => {
    return {
      label: label,
      click() {
        device.setStarlight([speed].concat(colors));
      },
    };
  };

  const menuFor = (colors) => {
    return [
      singleItem('慢速', 3, colors),
      singleItem('中速', 2, colors),
      singleItem('快速', 1, colors),
    ];
  };

  return {
    label: '星光效果',
    submenu: [
      {
        label: '自定义颜色',
        submenu: menuFor([device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b]),
      },
      {
        label: '自定义双色',
        submenu: menuFor([device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b, device.settings.customColor2.rgb.r, device.settings.customColor2.rgb.g, device.settings.customColor2.rgb.b]),
      },
      {
        label: '随机',
        submenu: menuFor([]),
      },
      {
        label: '红色',
        submenu: menuFor([0xff, 0, 0]),
      },
      {
        label: '绿色',
        submenu: menuFor([0, 0xff, 0]),
      },
      {
        label: '蓝色',
        submenu: menuFor([0, 0, 0xff]),
      },
      {
        label: '紫色',
        submenu: menuFor([0x80, 0, 0x80]),
      },
      {
        label: '水色',
        submenu: menuFor([0, 0xff, 0xff]),
      },
      {
        label: '橙色',
        submenu: menuFor([0xff, 0x45, 0]),
      },
      {
        label: '红绿双色',
        submenu: menuFor([0xff, 0, 0, 0, 0xff, 0]),
      },
      {
        label: '红蓝双色',
        submenu: menuFor([0xff, 0, 0, 0, 0, 0xff]),
      },
      {
        label: '蓝绿双色',
        submenu: menuFor([0, 0, 0xff, 0, 0xff, 0]),
      },
    ],
  };
}

function getFeatureStatic(application, device, feature) {
  const singleItem = (label, color) => {
    return {
      label: label,
      click() {
        device.setModeStatic(color);
      },
    };
  };

  const subMenu = [
    singleItem('自定义颜色', [device.settings.customColor1.rgb.r, device.settings.customColor1.rgb.g, device.settings.customColor1.rgb.b]),
    feature.hasAllColors() ? singleItem('白色', [0xff, 0xff, 0xff]) : null,
    feature.configuration.enabledRed ? singleItem('红色', [0xff, 0, 0]) : null,
    feature.configuration.enabledGreen ? singleItem('绿色', [0, 0xff, 0]) : null,
    feature.configuration.enabledBlue ? singleItem('蓝色', [0, 0, 0xff]) : null,
  ];

  return {
    label: '静态效果',
    submenu: subMenu.filter(s => s !== null),
  };
}

function getFeatureWaveExtended(application, device, feature) {
  const singleItem = (label, directionSpeed) => {
    return {
      label: label,
      click() {
        device.setWaveExtended(directionSpeed);
      },
    };
  };

  const menuFor = (direction) => {
    return [
      singleItem('龟速', direction + '_turtle'),
      singleItem('最慢', direction + '_slowest'),
      singleItem('较慢', direction + '_slower'),
      singleItem('慢速', direction + '_slow'),
      singleItem('正常', direction + '_default'),
      singleItem('快速', direction + '_fast'),
      singleItem('较快', direction + '_faster'),
      singleItem('最快', direction + '_fastest'),
      singleItem('闪电', direction + '_lightning'),
    ];
  };

  return {
    label: '波浪效果',
    submenu: [
      {
        label: '向左',
        submenu: menuFor('left'),
      },
      {
        label: '向右',
        submenu: menuFor('right'),
      },
    ],
  };
}

function getFeatureWaveSimple(application, device, feature) {
  return {
    label: '波浪效果',
    submenu: [
      {
        label: '向左',
        click() {
          device.setWaveSimple('left');
        },
      },
      {
        label: '向右',
        click() {
          device.setWaveSimple('right');
        },
      },
    ],
  };
}

function getFeatureMouseBrightness(application, device, feature) {
  const submenu = [
    feature.configuration.enabledMatrix ? {
      label: '全部 (' + device.getBrightnessMatrix() + '%)',
      submenu: [
        {
          label: '0%', click() {
            device.setBrightnessMatrix(0);
            application.refreshTray();
          },
        },
        {
          label: '100%', click() {
            device.setBrightnessMatrix(100);
            application.refreshTray();
          },
        },
      ],
    } : null,
    feature.configuration.enabledLogo ? {
      label: '标志 (' + device.getBrightnessLogo() + '%)',
      submenu: [
        {
          label: '0%', click() {
            device.setBrightnessLogo(0);
            application.refreshTray();
          },
        },
        {
          label: '100%', click() {
            device.setBrightnessLogo(100);
            application.refreshTray();
          },
        },
      ],
    } : null,
    feature.configuration.enabledScroll ?
      {
        label: '滚轮 (' + device.getBrightnessScroll() + '%)',
        submenu: [
          {
            label: '0%', click() {
              device.setBrightnessScroll(0);
              application.refreshTray();
            },
          },
          {
            label: '100%', click() {
              device.setBrightnessScroll(100);
              application.refreshTray();
            },
          },
        ],
      } : null,
    feature.configuration.enabledLeft ?
      {
        label: '左 (' + device.getBrightnessLeft() + '%)',
        submenu: [
          {
            label: '0%', click() {
              device.setBrightnessLeft(0);
              application.refreshTray();
            },
          },
          {
            label: '100%', click() {
              device.setBrightnessLeft(100);
              application.refreshTray();
            },
          },
        ],
      } : null,
    feature.configuration.enabledRight ?
      {
        label: '右 (' + device.getBrightnessRight() + '%)',
        submenu: [
          {
            label: '0%', click() {
              device.setBrightnessRight(0);
              application.refreshTray();
            },
          },
          {
            label: '100%', click() {
              device.setBrightnessRight(100);
              application.refreshTray();
            },
          },
        ],
      } : null,
  ];

  return {
    label: '亮度',
    submenu: submenu.filter(s => s!= null),
  };
}
