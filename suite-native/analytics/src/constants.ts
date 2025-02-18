export enum EventType {
    OnboardingCompleted = 'onboarding_completed',
    ScreenChange = 'screen_change',
    AppReady = 'app_ready',
    AssetsSync = 'assets_sync',
    WatchPortfolioTimeframeChange = 'watch_portfolio/timeframe_change',
    CreateReceiveAddress = 'create_receive_address',
    CreateReceiveAddressShowAddress = 'create_receive_address/show_address',
    AssetDetail = 'asset_detail',
    AssetDetailTimeframeChange = 'asset_detail/timeframe_change',
    TransactionDetail = 'transaction_detail',
    TransactionDetailParameters = 'transaction_detail/parameters',
    TransactionDetailCompareValues = 'transaction_detail/compare_values',
    TransactionDetailInputOutput = 'transaction_detail/input_output',
    TransactionDetailExploreInBlockchain = 'transaction_detail/explore_in_blockchain',
    SettingsChangeCurrency = 'settings/change_currency',
    SettingsChangeTheme = 'settings/change_theme',
    SettingsChangeBtcUnit = 'settings/change_btc_unit',
    SettingsDiscreetToggle = 'settings/discreet_toggle',
    SettingsBiometricsToggle = 'settings/biometrics_toggle',
    SettingsDataPermission = 'settings/data_permission',
}
