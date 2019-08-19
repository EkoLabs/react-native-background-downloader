import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
        paddingHorizontal: 10,
    },
    textInput: {
        height: 70,
        width: 300,
        borderColor: 'grey',
        borderWidth: 1,
        padding: 10,
    },
    downloadingList: {
        flex: 1,
        width: '100%'
    },
    downloadItem: {
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
        justifyContent: 'space-between'
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10
    }
});
