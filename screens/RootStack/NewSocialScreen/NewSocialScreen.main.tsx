import React, { useState, useEffect } from "react";
import { Platform, View } from "react-native";
import { Appbar, TextInput, Snackbar, Button } from "react-native-paper";
import { getFileObjectAsync, uuid } from "../../../Utils";

// See https://github.com/mmazzarolo/react-native-modal-datetime-picker
// Most of the date picker code is directly sourced from the example.
import DateTimePickerModal from "react-native-modal-datetime-picker";

// See https://docs.expo.io/versions/latest/sdk/imagepicker/
// Most of the image picker code is directly sourced from the example.
import * as ImagePicker from "expo-image-picker";
import { styles } from "./NewSocialScreen.styles";

import firebase from "firebase/app";
import "firebase/firestore";
import { SocialModel } from "../../../models/social";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../RootStackScreen";
import { getFirestore, doc, collection, addDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { getApp } from "firebase/app";
import DateTimePicker from "react-native-modal-datetime-picker";

interface Props {
  navigation: StackNavigationProp<RootStackParamList, "NewSocialScreen">;
}

export default function NewSocialScreen({ navigation }: Props) {
  /* TODO: Declare state variables for all of the attributes 
           that you need to keep track of on this screen.
    
     HINTS:
      1. There are five core attributes that are related to the social object.
      2. There are two attributes from the Date Picker.
      3. There is one attribute from the Snackbar.
      4. There is one attribute for the loading indicator in the submit button.
  
  */
  const [eventname, setName] = useState("")
  const [eventloco, setLocation] = useState("")
  const [eventdescription, setDescription] = useState("")
  const [eventdate, setDate] = useState("")
  const [eventpicture, setPicture] = useState("")
  const [isdatepickervisible, setDatePickerVisibility] = useState(false)
  const [issnackbarvisible, setSnackbarVisibility] = useState(false)
  const [isLoading, setLoading] = useState(false)

  // TODO: Follow the Expo Docs to implement the ImagePicker component.
  // https://docs.expo.io/versions/latest/sdk/imagepicker/

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    console.log(result)

    if (!result.canceled) {
      setPicture(result.assets[0].uri)
    }
  }


  // TODO: Follow the GitHub Docs to implement the react-native-modal-datetime-picker component.
  // https://github.com/mmazzarolo/react-native-modal-datetime-picker

  const showDatePicker = () => {
    setDatePickerVisibility(true)
  }

  const hideDatePicker = () => {
    setDatePickerVisibility(false)
  }

  const handleConfirm = (date: Date) => {

    let currentMonth = date.getMonth() + 1
    let currentDate = date.getDate()
    let sdate = date.getFullYear()+"-" +currentMonth + "-" + currentDate 
    
    setDate(sdate)
    hideDatePicker();
  };

  
  // TODO: Follow the SnackBar Docs to implement the Snackbar component.
  // https://callstack.github.io/react-native-paper/snackbar.html

  const dismisssnackbar = () => setSnackbarVisibility(false)

  const saveEvent = async () => {
    // TODO: Validate all fields (hint: field values should be stored in state variables).
    // If there's a field that is missing data, then return and show an error
    // using the Snackbar.

    if (!eventname || !eventloco || !eventdescription || !eventpicture || !eventdate) {
      setSnackbarVisibility(true)
      return
    }

    // Otherwise, proceed onwards with uploading the image, and then the object.

    try {

      // NOTE: THE BULK OF THIS FUNCTION IS ALREADY IMPLEMENTED FOR YOU IN HINTS.TSX.
      // READ THIS TO GET A HIGH-LEVEL OVERVIEW OF WHAT YOU NEED TO DO, THEN GO READ THAT FILE!

      // (0) Firebase Cloud Storage wants a Blob, so we first convert the file path
      // saved in our eventImage state variable to a Blob.

      // (1) Write the image to Firebase Cloud Storage. Make sure to do this
      // using an "await" keyword, since we're in an async function. Name it using
      // the uuid provided below.
      
      // (2) Get the download URL of the file we just wrote. We're going to put that
      // download URL into Firestore (where our data itself is stored). Make sure to
      // do this using an async keyword.

      // (3) Construct & write the social model to the "socials" collection in Firestore.
      // The eventImage should be the downloadURL that we got from (3).
      // Make sure to do this using an async keyword.
      
      // (4) If nothing threw an error, then go back to the previous screen.
      //     Otherwise, show an error.
      
      //0
      const object: any = await getFileObjectAsync(eventpicture);
      //1
      const storage = getStorage(getApp());
      const storageRef = ref(storage, uuid() + ".jpg");
      const result = await uploadBytes(storageRef, object);
      //2
      const downloadURL = await getDownloadURL(result.ref);
      //3
      
      const db = getFirestore();
      const socialRef = collection(db, "socials");
      const socialDoc: SocialModel = {
        eventName: eventname,
        eventDate: eventdate,
        eventLocation: eventloco,
        eventDescription: eventdescription,
        eventImage: downloadURL,
      };
      await addDoc(socialRef, socialDoc);
      console.log("Finished social creation.");
      setLoading(false)
      navigation.goBack();

      //4
      } catch (e) {
        console.log("Error while writing social:", e);
      }
      
    
  };

  const Bar = () => {
    return (
      <Appbar.Header>
        <Appbar.Action onPress={navigation.goBack} icon="close" />
        <Appbar.Content title="Socials" />
      </Appbar.Header>
    );
  };

  return (
    <>
      <Bar />
      <View style={{ ...styles.container, padding: 20 }}>
        {/* TextInput */}
        <TextInput
          value = {eventname}
          label = "Event Name"
          onChangeText={setName}
        />
        {/* TextInput */}
        <TextInput 
          value = {eventloco}
          label = "Event Location"
          onChangeText={setLocation}
        />
        {/* TextInput */}
        <TextInput
          value = {eventdescription}
          label = "Event Description"
          onChangeText={setDescription}
        />
        {/* Button */}
        
        <Button onPress={() => setDatePickerVisibility(true)}>
          {eventdate ? eventdate.toLocaleString() : "Select date"}
        </Button>
        
        {/* Button */}
        <Button onPress={pickImage}>
          {eventpicture ? "Change Image" : "Select Image"}
        </Button>

        {/* Button */}
        <Button 
          style={{ marginBottom: 16 }}
          mode="contained"
          loading={isLoading}
          onPress={saveEvent}
        >
          Save Event
        </Button>

        {/* DateTimePickerModal */}
        <DateTimePickerModal
            isVisible={isdatepickervisible}
            mode='datetime'
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
        />
        {/* Snackbar */}
        <Snackbar
            visible={issnackbarvisible}
            onDismiss={dismisssnackbar}
            action={{ 
              label: 'Undo', 
              onPress: () => setSnackbarVisibility(false)
            }}>
            Please make sure to fill out all fields.
        </Snackbar>
      </View>
    </>
  );
}
