<?php

$moduleProviders = [];
$modulesPath = __DIR__ . '/../Modules';
if (is_dir($modulesPath)) {
    foreach (scandir($modulesPath) as $moduleDir) {
        if ($moduleDir === '.' || $moduleDir === '..') continue;
        $providerPath = $modulesPath . '/' . $moduleDir . '/Providers/' . $moduleDir . 'ServiceProvider.php';
        $configPath = $modulesPath . '/' . $moduleDir . '/Config/config.php';
        if (file_exists($providerPath) && file_exists($configPath)) {
            $config = include $configPath;
            if (!isset($config['enabled']) || $config['enabled']) {
                $providerClass = 'Modules\\' . $moduleDir . '\\Providers\\' . $moduleDir . 'ServiceProvider';
                $moduleProviders[] = $providerClass;
            }
        }
    }
}

return array_merge([
    App\Providers\AppServiceProvider::class,
], $moduleProviders);
