# SIGAP Exambro Proguard Rules
-keepattributes *Annotation*
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class id.sch.sdnkalibotolor10.sigap.ExambroBridge { *; }
