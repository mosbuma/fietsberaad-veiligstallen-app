export const SuccessModal = ({ message }) => {
    return (
        <div className="auth-success-msg">
            <p>{message}</p>
        </div>
    )
}
export const ErrModal = ({ message }) => {
    return (
        <div className="auth-err-msg">
            <p>{message}</p>
        </div>
    )
}