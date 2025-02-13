use tauri::{window, Emitter, Manager};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        //Create window programatically
        .setup(|app| {
            tauri::WebviewWindowBuilder::new(
                app,
                "main",
                tauri::WebviewUrl::App("index.html".into())
            )
            .title("moongate app")
            .visible(false)
            .build()?;
            Ok(())
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![get_app_window_size, show_main_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_app_window_size() -> [i16; 2] {
    let mut pos_array: [i16; 2] = [0; 2];
    pos_array[0] = 552;
    pos_array[1] = 350;
    println!("Will return app window size. {pos_array:?}");
    pos_array.into()
}

#[tauri::command]
fn show_main_window(app_handle: tauri::AppHandle){
    let main_window = app_handle.get_webview_window("main");
    //show main window
    match main_window.as_ref().unwrap().show() {
        Ok(result) => result,
        Err(error) => panic!("Problem showing `main` WebviewWindow: {error:?}"),
    };
    //focus main window - bring to front
    match main_window.as_ref().unwrap().set_focus(){
        Ok(result) => result,
        Err(error) => panic!("Problem focusing `main` WebviewWindow: {error:?}"),
    };
    //.expect("webview window `main` should exist");
}