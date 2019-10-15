
Pod::Spec.new do |s|
  s.name         = 'react-native-background-downloader'
  s.version      = '1.0.0'
  s.summary      = 'React Native background downloader'
  s.description  = <<-DESC
  A library for React-Native to help you download large files on iOS and Android both in the foreground and most importantly in the background.
                   DESC
  s.author       = 'elad@helleko.com'
  s.homepage     = 'https://github.com/learnyst/react-native-background-downloader'
  s.license      = 'MIT'
  s.platform     = :ios, '7.0'
  s.source       = { git: 'https://github.com/learnyst/react-native-background-downloader.git', tag: 'master' }
  s.source_files = 'ios/**/*.{h,m}'
  s.requires_arc = true

  s.dependency 'React'
end
