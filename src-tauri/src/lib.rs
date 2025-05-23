use little_exif::exif_tag::ExifTag;
use little_exif::metadata::Metadata;
use tauri::{utils::config::Position, window, Emitter, Manager, PhysicalPosition};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_dialog::init())
        //Create window programatically
        .setup(|app| {
            tauri::WebviewWindowBuilder::new(
                app,
                "main",
                tauri::WebviewUrl::App("index.html".into()),
            )
            .title("moongate app")
            .center()
            .visible(false)
            .build()?;
            Ok(())
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            get_app_window_size,
            show_main_window,
            position_on_monitor,
            write_metadata_to_file
        ])
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
fn show_main_window(app_handle: tauri::AppHandle) {
    let main_window = app_handle.get_webview_window("main");
    //show main window
    match main_window.as_ref().unwrap().show() {
        Ok(result) => result,
        Err(error) => panic!("Problem showing `main` WebviewWindow: {error:?}"),
    };
    //focus main window - bring to front
    match main_window.as_ref().unwrap().set_focus() {
        Ok(result) => result,
        Err(error) => panic!("Problem focusing `main` WebviewWindow: {error:?}"),
    };
    //.expect("webview window `main` should exist");
}

#[tauri::command]
fn position_on_monitor(app_handle: tauri::AppHandle, monitor_name: String) {
    //Get main window
    let main_window = app_handle.get_webview_window("main");
    //Get list of all monitors
    let monitors = main_window.as_ref().unwrap().available_monitors().unwrap();
    // println!("List of monitors:");//DEBUG
    // for m in &monitors {//DEBUG
    //     println!("{0:?}", m.name());
    // }
    //Look for matching monitor based on name
    // println!("Passed monitor name: {0:?}",&monitor_name);//DEBUG
    let last_monitor = monitors
        .iter()
        .find(|&monitor| monitor.name().unwrap() == &monitor_name);
    // println!("App was closed on Monitor: {0:?}", last_monitor);//DEBUG
    //fallback position if monitor was not found
    let mut x_pos = 0;
    let mut y_pos = 0;
    //if monitor was found, use its position values
    if !last_monitor.is_none() {
        x_pos = last_monitor.unwrap().position().x;
        y_pos = last_monitor.unwrap().position().y;
    }
    // println!("Grabbed monitor position values, X:{0:?} Y:{1:?}", x_pos,y_pos);//DEBUG
    //place window on correct monitor
    match main_window
        .unwrap()
        .set_position(PhysicalPosition::new(x_pos, y_pos))
    {
        Ok(result) => result,
        Err(error) => panic!("Problem placing `main` WebviewWindow: {error:?}"),
    };
}

#[tauri::command]
fn write_metadata_to_file(image_file: String, user_handle: String, description: String) {
    println!(
        "This is where the metadata would be written to file: {}",
        image_file
    );
    let image_path = std::path::Path::new(&image_file);
    let metadata = Metadata::new_from_path(&image_path);
    // let mut metadata = Metadata::new_from_path(&image_path);

    // metadata.unwrap().set_tag(
    //     // ExifTag::ImageDescription("Hello World!".to_string())
    //     ExifTag::ImageDescription(image_file)
    // );
    match metadata {
        Ok(mut m) => {
            m.set_tag(
                //Using "Title" field because the "Description" field is an IPTC field, which is not supported
                ExifTag::ImageDescription(description.to_string()), //"Title" field
            );
            m.set_tag(ExifTag::Artist(user_handle.to_string()));
            let _ = m.write_to_file(&image_path);
        }
        Err(e) => {
            println!("Error: {}", e);
        }
    }
    // match metadata {
    //     Ok(m) => {
    //         m.write_to_file(&image_path);
    //     },
    //     Err(e) => {
    //         println!("Error: {}",e);
    //     }
    // }
    // metadata.unwrap().write_to_file(&image_path);
    // Ok(())
}
